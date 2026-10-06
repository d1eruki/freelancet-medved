# Этикетки продукции

В материалах заказчика есть 14 отдельных файлов этикеток: 4 JPG для банок и 10 PDF для литровой упаковки. Они сопоставлены с изображениями всех 28 вариантов розничной упаковки из [текущего каталога сайта](../src/data/catalog.js): 18 банок, 7 литровых упаковок и 3 бутылки объёмом 0,75 л.

Для 9 позиций есть файлы с другим оформлением или характеристиками; ещё 5 файлов относятся к продуктам, которых нет среди соответствующих вариантов упаковки сайта. Для 10 позиций отдельных файлов нет. Полных совпадений с этикетками на изображениях сайта среди полученных файлов не найдено.

В таблицах «Другая версия» означает, что файл есть, но он не соответствует изображению упаковки сайта. «Нет файла» означает отсутствие отдельного файла этикетки; изображение упаковки в каталоге не заменяет такой файл.

## Алюминиевые банки — 0,33 и 0,45 л

Файлы JPG находятся в `materials/customer-design/labels/cans-330ml-500ml/`. На всех четырёх этикетках указан объём 450 мл; отдельных макетов 330 мл нет. Название папки с `500ml` не соответствует объёму на самих этикетках.

| Продукт сайта | Изображения упаковки сайта | Полученный файл | Результат сверки |
|---|---|---|---|
| Мид «Мэрион» Помэгрэнет энд берри | [0,33 л](../src/assets/products/mead/marion-pomegranate-berry-330ml.png), [0,45 л](../src/assets/products/mead/marion-pomegranate-berry-450ml.png) | — | Нет файла для 0,33 и 0,45 л. |
| Мид «Мэрион» Манго | [0,33 л](../src/assets/products/mead/marion-mango-330ml.png), [0,45 л](../src/assets/products/mead/marion-mango-450ml.png) | [mango.jpg](../materials/customer-design/labels/cans-330ml-500ml/mango.jpg) | Другая версия. В JPG витраж заполняет фон; на банках сайта рисунок расположен в рамке на чёрном фоне. Файл рассчитан на 450 мл; макета 330 мл нет. |
| Сидр «Хмеляр» | [0,33 л](../src/assets/products/cider/khmelyar-330ml.png), [0,45 л](../src/assets/products/cider/khmelyar-450ml.png) | — | Нет файла для 0,33 и 0,45 л. |
| Сидр «Вудсток» | [0,33 л](../src/assets/products/cider/woodstock-330ml.png), [0,45 л](../src/assets/products/cider/woodstock-450ml.png) | — | Нет файла для 0,33 и 0,45 л. |
| Сидр «Мэрион» Блэккорант энд берри | [0,33 л](../src/assets/products/cider/marion-blackcurrant-berry-330ml.png), [0,45 л](../src/assets/products/cider/marion-blackcurrant-berry-450ml.png) | [blackcurrant-and-berry.jpg](../materials/customer-design/labels/cans-330ml-500ml/blackcurrant-and-berry.jpg) | Другая версия. В JPG витраж заполняет фон; на банках сайта рисунок расположен в рамке на чёрном фоне. Файл рассчитан на 450 мл; макета 330 мл нет. |
| Сидр «Мэрион» Берри | [0,33 л](../src/assets/products/cider/marion-berry-330ml.png), [0,45 л](../src/assets/products/cider/marion-berry-450ml.png) | [berry.jpg](../materials/customer-design/labels/cans-330ml-500ml/berry.jpg) | Другая версия. В JPG витраж заполняет фон; на банках сайта рисунок расположен в рамке на чёрном фоне. Файл рассчитан на 450 мл; макета 330 мл нет. |
| Сидр Вишневый | [0,33 л](../src/assets/products/cider/cherry-330ml.png), [0,45 л](../src/assets/products/cider/cherry-450ml.png) | — | Нет файла для 0,33 и 0,45 л. |
| Сидр «Антоновка» | [0,33 л](../src/assets/products/cider/antonovka-330ml.png), [0,45 л](../src/assets/products/cider/antonovka-450ml.png) | — | Нет файла для 0,33 и 0,45 л. |
| Пуаре «Мистер Вильямс» | [0,33 л](../src/assets/products/perry/mister-williams-330ml.png), [0,45 л](../src/assets/products/perry/mister-williams-450ml.png) | — | Нет файла для 0,33 и 0,45 л. |

## Литровая упаковка — 1 л

Файлы PDF находятся в `materials/customer-design/labels/1-liter/`; размер `280x292` сохранён в именах файлов. Совпадение вкуса не означает совпадения версии этикетки.

| Продукт сайта | Изображение упаковки сайта | Полученный файл | Результат сверки |
|---|---|---|---|
| Мид «Мэрион» Манго | [1 л](../src/assets/products/mead/marion-mango-1l.png) | [mango-280x292.pdf](../materials/customer-design/labels/1-liter/mango-280x292.pdf) | Другая версия. В PDF 5,5%, на упаковке сайта 4,9%; отличаются иллюстрация манго и цвет нижнего поля. |
| Мид «Мёдведь» Клюквенная | [1 л](../src/assets/products/mead/medved-cranberry-1l.png) | — | Нет файла. |
| Мид «Мёдведь» с лесными ягодами | [1 л](../src/assets/products/mead/medved-forest-berries-1l.png) | [forest-berries-280x292.pdf](../materials/customer-design/labels/1-liter/forest-berries-280x292.pdf) | Другая версия. В PDF 5,5%, на упаковке сайта 4,9%; отличается ягодная иллюстрация. |
| Мид «Мёдведь» Облепиховая | [1 л](../src/assets/products/mead/medved-sea-buckthorn-1l.png) | [sea-buckthorn-280x292.pdf](../materials/customer-design/labels/1-liter/sea-buckthorn-280x292.pdf) | Другая версия. В PDF 5,5%, на упаковке сайта 4,9%; отличается иллюстрация облепихи. |
| Мид «Мёдведь» Сливовая | [1 л](../src/assets/products/mead/medved-plum-1l.png) | [plum-280x292.pdf](../materials/customer-design/labels/1-liter/plum-280x292.pdf) | Другая версия. В PDF 5,5%, на упаковке сайта 4,9%; отличается иллюстрация слив. |
| Мид «Мёдведь» Черносмородиновая | [1 л](../src/assets/products/mead/medved-blackcurrant-1l.png) | [blackcurrant-280x292.pdf](../materials/customer-design/labels/1-liter/blackcurrant-280x292.pdf) | Другая версия. В PDF 5,5%, на упаковке сайта 4,9%; отличается иллюстрация смородины. |
| Пуаре «Мистер Вильямс» | [1 л](../src/assets/products/perry/mister-williams-1l.png) | [pear-280x292.pdf](../materials/customer-design/labels/1-liter/pear-280x292.pdf) | Другая версия. В PDF 5,5% и оранжевое нижнее поле, на упаковке сайта 4,9% и зелёное поле; отличается иллюстрация груш. |

## Бутылки — 0,75 л

| Продукт сайта | Изображение упаковки сайта | Полученный файл | Результат сверки |
|---|---|---|---|
| Сидр Вишневый | [0,75 л](../src/assets/products/cider/cherry-750ml.png) | — | Нет файла. |
| Сидр «Антоновка» | [0,75 л](../src/assets/products/cider/antonovka-750ml.png) | — | Нет файла. |
| Пуаре «Мистер Вильямс» | [0,75 л](../src/assets/products/perry/mister-williams-750ml.png) | — | Нет файла. |

## Файлы без соответствующего варианта в каталоге сайта

| Полученная этикетка | Упаковка | Файл | Результат сверки |
|---|---|---|---|
| MARION TROPIC | Банка 0,45 л | [tropic.jpg](../materials/customer-design/labels/cans-330ml-500ml/tropic.jpg) | Такого варианта упаковки нет в текущем каталоге сайта. |
| Вишня | 1 л | [cherry-280x292.pdf](../materials/customer-design/labels/1-liter/cherry-280x292.pdf) | Такого варианта упаковки нет в текущем каталоге сайта. |
| Яблоко | 1 л | [apple-280x292-v2.pdf](../materials/customer-design/labels/1-liter/apple-280x292-v2.pdf) | Такого варианта упаковки нет в текущем каталоге сайта. |
| Медовуха тёмная | 1 л | [dark-mead-280x292.pdf](../materials/customer-design/labels/1-liter/dark-mead-280x292.pdf) | Такого варианта упаковки нет в текущем каталоге сайта. |
| Медовуха светлая | 1 л | [light-mead-280x292.pdf](../materials/customer-design/labels/1-liter/light-mead-280x292.pdf) | Такого варианта упаковки нет в текущем каталоге сайта. |
