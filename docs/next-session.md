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

1. **`actions-config`**: воркер закоммитил `ffc0a3f` (86 тестов, полный прогон 1156 OK). Не исправлены два разрыва контракта:
   - `expand_command` не считает кириллические `{зона}` подстановками;
   - `load_extra_sections` склеивает `[action:Main]` и `[action:main]` → после сохранения файл нечитаем (`DuplicateOptionError` вместо кода 3).
   Отчёт: `/tmp/gridsnap-actions-workerA-report.md`. Фикс можно отправить в `dispatch:ctx_d76bc00f40ac`.
2. **`task_0a2e0d49ec5d`** (команда action, хоткеи, дым) — последний известный статус `dispatched`, диспатч `ctx_21c6e9dc06a2`, агент живой.
3. **Почта Orca**: Run `run_c3ffdc05f333` доставляется в терминал `term_dafd89ec-…`. Новая сессия в том же терминале сохранит этот handle; чтобы отвязаться — открыть новый терминал/вкладку в Orca (новый handle) и не подписывать его на тот же Run.
4. **Пресеты не применены**: `~/.omp/presets/` пуст, `config.yml` не менялся (только план).

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
2. Запустить `omp` (или `omp --config ~/.omp/presets/cache-safe.yml`, если пресеты уже скопированы).
3. Вставить стартовый промпт выше.
