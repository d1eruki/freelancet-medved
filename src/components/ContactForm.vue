<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import BaseButton from './BaseButton.vue'
import { sitePath } from '../utils/site-path'
import { trackMetrikaGoal } from '../utils/metrika.js'

const props = defineProps({
  idPrefix: {
    type: String,
    required: true,
  },
  tone: {
    type: String,
    default: 'light',
    validator: (value) => ['light', 'dark'].includes(value),
  },
})

const emit = defineEmits(['success'])

const fields = reactive({
  name: '',
  phone: '',
  email: '',
  message: '',
  consent: false,
  website: '',
})
const status = ref('idle')
const feedback = ref('')
const phoneError = ref('')
const phoneInput = ref(null)
let submissionController = null

onBeforeUnmount(() => submissionController?.abort())

const isDark = computed(() => props.tone === 'dark')
const labelClass = computed(() => isDark.value ? 'text-surface' : 'text-foreground')
const fieldClass = computed(() => isDark.value
  ? 'border-surface/50 bg-surface text-foreground focus-visible:outline-surface'
  : 'border-foreground/20 bg-panel text-foreground focus-visible:outline-brand')
const consentClass = computed(() => isDark.value ? 'text-surface/85' : 'text-subtle')

function resetFields() {
  fields.name = ''
  fields.phone = ''
  fields.email = ''
  fields.message = ''
  fields.consent = false
  fields.website = ''
}

function formatPhone(digits) {
  if (!digits) return ''

  let value = `(${digits.slice(0, 3)}`
  if (digits.length >= 3) value += ')'
  if (digits.length > 3) value += ` ${digits.slice(3, 6)}`
  if (digits.length > 6) value += `-${digits.slice(6, 8)}`
  if (digits.length > 8) value += `-${digits.slice(8, 10)}`
  return value
}

function positionAfterDigits(value, count) {
  if (!count) return value ? 1 : 0

  let seen = 0
  for (let index = 0; index < value.length; index += 1) {
    if (!/\d/.test(value[index])) continue
    seen += 1
    if (seen !== count) continue

    let position = index + 1
    while (position < value.length && !/\d/.test(value[position])) position += 1
    return position
  }
  return value.length
}

function onPhoneInput(event) {
  const input = event.target
  const rawValue = input.value
  let digitsBeforeCursor = rawValue.slice(0, input.selectionStart ?? rawValue.length).replace(/\D/g, '').length
  let digits = rawValue.replace(/\D/g, '')

  if (digits.length > 10 && /^[78]/.test(digits)
    && (event.inputType === 'insertFromPaste' || /^\s*\+7/.test(rawValue))) {
    digits = digits.slice(1)
    digitsBeforeCursor = Math.max(0, digitsBeforeCursor - 1)
  }

  if (digits.length === fields.phone.length && rawValue !== formatPhone(fields.phone)) {
    if (event.inputType === 'deleteContentBackward' && digitsBeforeCursor > 0) {
      digits = digits.slice(0, digitsBeforeCursor - 1) + digits.slice(digitsBeforeCursor)
      digitsBeforeCursor -= 1
    } else if (event.inputType === 'deleteContentForward') {
      digits = digits.slice(0, digitsBeforeCursor) + digits.slice(digitsBeforeCursor + 1)
    }
  }

  fields.phone = digits.slice(0, 10)
  input.value = formatPhone(fields.phone)
  input.setSelectionRange(
    positionAfterDigits(input.value, Math.min(digitsBeforeCursor, fields.phone.length)),
    positionAfterDigits(input.value, Math.min(digitsBeforeCursor, fields.phone.length)),
  )
  phoneError.value = ''
}

async function submitForm() {
  if (status.value === 'sending') return

  status.value = 'idle'
  feedback.value = ''
  if (!/^\d{10}$/.test(fields.phone)) {
    phoneError.value = 'Введите 10 цифр после +7.'
    phoneInput.value?.focus()
    return
  }

  phoneError.value = ''
  status.value = 'sending'
  const controller = new AbortController()
  submissionController = controller
  let timedOut = false
  const timeout = window.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, 15000)

  try {
    const phoneDigits = `7${fields.phone}`
    const response = await fetch(sitePath('/api/contact.php'), {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...fields, phone: phoneDigits }),
    })
    const result = await response.json()
    const serverMessage = typeof result?.message === 'string' ? result.message.trim() : ''

    if (!response.ok || result?.ok !== true) {
      status.value = 'error'
      feedback.value = serverMessage || 'Не удалось отправить сообщение. Попробуйте ещё раз.'
      trackMetrikaGoal('contact_form_error', { reason: 'server' })
      return
    }

    status.value = 'success'
    feedback.value = serverMessage || 'Спасибо! Сообщение отправлено.'
    trackMetrikaGoal('contact_form_success')
    resetFields()
    emit('success')
  } catch {
    if (controller.signal.aborted && !timedOut) return
    status.value = 'error'
    feedback.value = timedOut
      ? 'Сервер не ответил вовремя. Сообщение могло быть отправлено — повторите попытку чуть позже.'
      : 'Не удалось отправить сообщение. Проверьте соединение и попробуйте ещё раз.'
    trackMetrikaGoal('contact_form_error', { reason: timedOut ? 'timeout' : 'request' })
  } finally {
    window.clearTimeout(timeout)
    if (submissionController === controller) submissionController = null
  }
}
</script>

<template>
  <form class="grid min-w-0 gap-6 nav:grid-cols-2" @submit.prevent="submitForm">
    <div>
      <label class="mb-3 block text-label font-extrabold tracking-wide uppercase" :class="labelClass" :for="`${idPrefix}-name`">Ваше имя *</label>
      <input :id="`${idPrefix}-name`" v-model.trim="fields.name" class="min-h-14 w-full rounded-xl border px-5 text-body font-medium focus-visible:outline-4 focus-visible:outline-offset-2" :class="fieldClass" name="name" type="text" autocomplete="name" maxlength="120" required>
    </div>
    <div>
      <label class="mb-3 block text-label font-extrabold tracking-wide uppercase" :class="labelClass" :for="`${idPrefix}-phone`">Телефон *</label>
      <div class="flex min-w-0 items-center rounded-xl border pl-5 focus-within:outline-4 focus-within:outline-offset-2" :class="[fieldClass, isDark ? 'focus-within:outline-surface' : 'focus-within:outline-brand']">
        <span :id="`${idPrefix}-phone-code`" class="shrink-0 py-3 text-body font-medium">🇷🇺 +7</span>
        <input :id="`${idPrefix}-phone`" ref="phoneInput" :value="formatPhone(fields.phone)" class="min-h-14 min-w-0 flex-1 bg-transparent py-3 pl-3 pr-5 text-body font-medium outline-none" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" required :aria-invalid="Boolean(phoneError)" :aria-describedby="`${idPrefix}-phone-code${phoneError ? ` ${idPrefix}-phone-error` : ''}`" @input="onPhoneInput">
      </div>
      <p v-if="phoneError" :id="`${idPrefix}-phone-error`" class="mt-2 text-body font-semibold" :class="isDark ? 'text-red-300' : 'text-red-700'" role="alert">{{ phoneError }}</p>
    </div>
    <div class="nav:col-span-2">
      <label class="mb-3 block text-label font-extrabold tracking-wide uppercase" :class="labelClass" :for="`${idPrefix}-email`">Электронная почта</label>
      <input :id="`${idPrefix}-email`" v-model.trim="fields.email" class="min-h-14 w-full rounded-xl border px-5 text-body font-medium focus-visible:outline-4 focus-visible:outline-offset-2" :class="fieldClass" name="email" type="email" autocomplete="email" maxlength="254">
    </div>
    <div class="nav:col-span-2">
      <label class="mb-3 block text-label font-extrabold tracking-wide uppercase" :class="labelClass" :for="`${idPrefix}-message`">Сообщение</label>
      <textarea :id="`${idPrefix}-message`" v-model.trim="fields.message" class="min-h-36 w-full rounded-xl border p-5 text-body font-medium focus-visible:outline-4 focus-visible:outline-offset-2" :class="fieldClass" name="message" rows="5" maxlength="4000"></textarea>
    </div>

    <div class="absolute -left-[10000px] size-px overflow-hidden" aria-hidden="true">
      <label :for="`${idPrefix}-website`">Не заполняйте это поле</label>
      <input :id="`${idPrefix}-website`" v-model="fields.website" name="website" type="text" tabindex="-1" autocomplete="off">
    </div>

    <div class="nav:col-span-2">
      <label class="flex items-start gap-3 text-body font-medium" :class="consentClass">
        <input v-model="fields.consent" class="mt-1 size-5 shrink-0 accent-brand" name="consent" type="checkbox" required>
        <span>Я согласен(а) с условиями обработки персональных данных согласно <a class="underline underline-offset-4" :class="isDark ? 'hover:text-surface' : 'hover:text-foreground'" :href="sitePath('/politika-konfidencialnosti/')">политике конфиденциальности</a>.</span>
      </label>
    </div>
    <div class="flex flex-col items-start gap-4 nav:col-span-2 sm:flex-row sm:items-center">
      <BaseButton class="w-full py-4 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-60 disabled:shadow-none sm:w-auto" type="submit" :disabled="status === 'sending'">
        {{ status === 'sending' ? 'Отправляем…' : 'Отправить' }}
      </BaseButton>
      <p v-if="feedback" class="text-body font-semibold" :class="status === 'error' ? (isDark ? 'text-red-300' : 'text-red-700') : (isDark ? 'text-surface' : 'text-brand')" role="status" aria-live="polite">
        {{ feedback }}
      </p>
    </div>
  </form>
</template>
