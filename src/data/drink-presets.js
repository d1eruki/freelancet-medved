// Художественные параметры жидкости в локальном масштабе модели стакана.
// Поглощение и рассеяние задаются на единицу длины луча; цвет — в линейном RGB.
export const drinkPresets = {
  cider: {
    label: 'Сидр / пуаре',
    absorption: [0.07, 0.8, 2.8],
    scattering: 0,
    scatteringColor: [0, 0, 0],
    foamAllowed: false,
  },
  mead: {
    label: 'Медовуха',
    absorption: [0.35, 1.35, 3.4],
    scattering: 1.7,
    scatteringColor: [0.60, 0.30, 0.07],
    foamAllowed: true,
  },
}
