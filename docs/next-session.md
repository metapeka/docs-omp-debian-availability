# Передача в новую сессию

Дата: 2026-11-22. Состояние репозитория: `f278866`, `main` = `origin/main`, рабочее дерево чистое.

## Где всё лежит

| Что | Где |
|---|---|
| Вики (онлайн) | https://metapeka.github.io/docs-omp-debian-availability/wiki/ |
| Вики (локально) | `docs/wiki/index.html` |
| Полный markdown-док | `docs/omp-setup-2026-11.md` |
| Пресеты | `presets/cache-safe.yml`, `presets/quality.yml`, `presets/throughput.yml` |
| Кэш-ресерч | `docs/wiki/cache.html` (раздел 5, ресерч 22.11.2026) |

## Что зафиксировано

- Чек-лист настройки OMP на Debian (9 фаз) и конфиги.
- Слои Orca/OMP: кто владеет MCP, скиллами, агентами; следствия worktree.
- Оркестрация: Run → Task → Dispatch, handoff, mail, ловушки.
- Кэш префикса: что ломает, замеры (96.8% hit), правила, пресеты.
- Три пресета как `--config` оверлеи (в `~/.omp` не установлены).

## Открытые ниточки

1. **`actions-config`**: воркер закоммитил `ffc0a3f` (86 тестов, полный прогон 1156 OK), слияние
   в `origin/main` — `91bf83d`. Два разрыва контракта исправлены в ветке
   `fix/actions-contract` коммитом `7ff53a346c` (worktree
   `/home/db1/orca/workspaces/gridsnape/actions-contract`), полный прогон 1209 OK (4 skipped):
   - `{зона}` и `{что-то}` — `ActionError` → код 3, как `{zon}`; `${HOME}`, `{}`, `{print $1}`
     остаются литералами;
   - секции, различающиеся регистром, и повторы секций — код 3 вместо `DuplicateOptionError`/
     `DuplicateSectionError`; файл после отказа не меняется.
   Ветка не запушена: ждёт решения о PR.
2. **`task_0a2e0d49ec5d`** — диспатч `ctx_21c6e9dc06a2` больше не существует: worktree `actions-config`
   удалён, а `orca agent list` 2026-11-22 показывает только текущую сессию и спящую `melusine`.
   Считать закрытым: волна слита в `origin/main` (`91bf83d`), остаток — разрывы контракта (п. 1).
   `ctx_d76bc00f40ac` из п. 1 тоже недоступен — фикс сделан напрямую в ветке.
3. **Почта Orca**: Run `run_c3ffdc05f333` доставляется в терминал `term_dafd89ec-…`. Новая сессия в том же терминале сохранит этот handle; чтобы отвязаться — открыть новый терминал/вкладку в Orca (новый handle) и не подписывать его на тот же Run.
4. **Пресеты применены** (2026-11-22): `presets/*.yml` скопированы в `~/.omp/presets/`, `config.yml`
   не менялся — это оверлеи. Все три проверены прогоном `omp --config ~/.omp/presets/<p>.yml`:
   exit 0, чистый stderr, `advisor_yielded` только у quality/throughput, как и задано.
   Ловушка: `omp --config f.yml config list` оверлей не видит; проверять через
   `PI_CONFIG_FILES=~/.omp/presets/<p>.yml omp config list` (рецепт — в `presets/README.md`).

## Что теряется при чистой сессии

История диалога, parked-сабагенты (`agent://<id>`), todo и сессионные гранты approval. Файлы, коммиты, вики и пресеты — нет.

## Стартовый промпт

```text
Мы продолжаем работу по OMP на Debian. Всё зафиксировано в репозитории:
docs/wiki/index.html (вики), docs/omp-setup-2026-11.md (полный док),
presets/ (cache-safe, quality, throughput). Прочитай docs/next-session.md,
затем docs/wiki/cache.html и presets/README.md. Рабочее дерево чистое,
main = origin/main.
```

## Как начать чисто

1. Открыть **новый терминал/вкладку** в Orca (новый handle — почта старого Run сюда не придёт).
2. Запустить `omp` или `omp --config ~/.omp/presets/cache-safe.yml` (пресеты уже установлены).
3. Вставить стартовый промпт выше.
