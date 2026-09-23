<script setup>
import { computed, reactive, ref } from 'vue'
import { sitePath } from '../utils/site-path'

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

async function submitForm() {
  if (status.value === 'sending') return

  status.value = 'idle'
  feedback.value = ''
  const phoneDigits = fields.phone.replace(/\D/g, '')
  if (!/^\+?[\d\s()-]+$/.test(fields.phone) || phoneDigits.length !== 11) {
    phoneError.value = 'Введите номер из 11 цифр.'
    phoneInput.value?.focus()
    return
  }

  phoneError.value = ''
  status.value = 'sending'

  try {
    const formData = new URLSearchParams()
    formData.set('fid', 'feedback')
    formData.set('data[trap]', fields.website)
    formData.set('data[name]', fields.name)
    formData.set('data[message]', `Телефон: ${phoneDigits}${fields.message ? `\n\n${fields.message}` : ''}`)
    if (fields.email) formData.set('data[email]', fields.email)

    const response = await fetch('/udata://content/send/.json', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    })
    const result = await response.json().catch(() => ({}))
    const serverMessage = typeof result.message === 'string' ? result.message.trim() : ''

    if (!response.ok || ![true, 1, '1'].includes(result.success)) {
      status.value = 'error'
      feedback.value = serverMessage || 'Не удалось отправить сообщение. Попробуйте ещё раз.'
      return
    }

    status.value = 'success'
    feedback.value = serverMessage || 'Спасибо! Сообщение отправлено.'
    resetFields()
    emit('success')
  } catch (error) {
    status.value = 'error'
    feedback.value = error instanceof Error
      ? error.message
      : 'Не удалось отправить сообщение. Попробуйте ещё раз.'
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
      <input :id="`${idPrefix}-phone`" ref="phoneInput" v-model.trim="fields.phone" class="min-h-14 w-full rounded-xl border px-5 text-body font-medium focus-visible:outline-4 focus-visible:outline-offset-2" :class="fieldClass" name="phone" type="tel" autocomplete="tel" maxlength="60" required :aria-invalid="Boolean(phoneError)" :aria-describedby="phoneError ? `${idPrefix}-phone-error` : undefined" @input="phoneError = ''">
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
      <button class="min-h-14 w-full rounded-full bg-brand px-8 py-4 text-label font-extrabold tracking-wide text-surface uppercase transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:translate-y-0 disabled:cursor-wait disabled:opacity-60 disabled:shadow-none sm:w-auto" type="submit" :disabled="status === 'sending'">
        {{ status === 'sending' ? 'Отправляем…' : 'Отправить' }}
      </button>
      <p v-if="feedback" class="text-body font-semibold" :class="status === 'error' ? (isDark ? 'text-red-300' : 'text-red-700') : (isDark ? 'text-surface' : 'text-brand')" role="status" aria-live="polite">
        {{ feedback }}
      </p>
    </div>
  </form>
</template>
