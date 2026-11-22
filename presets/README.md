# Пресеты OMP

Два оверлея конфигурации. Не заменяют `~/.omp/agent/config.yml`, а накладываются на один запуск
через `--config`. Ничего не персистят.

| Файл | Режим | Когда |
|---|---|---|
| `cache-safe.yml` | «Суперкэш»: одна модель, пинненый thinking, без advisor/prewalk | обычная работа, длинные сессии, много сабагентов |
| `quality.yml` | сильная модель для плана и финального ревью | сложная задача, рискованный рефакторинг, перед PR |
| `throughput.yml` | параллелизм 8, ревью на сильной модели, fallback на любую ошибку | лимиты с запасом (4× и больше), важнее время, а не токены |

## Установка

```bash
mkdir -p ~/.omp/presets
cp presets/*.yml ~/.omp/presets/

# запуск
omp --config ~/.omp/presets/cache-safe.yml
omp --config ~/.omp/presets/quality.yml

# или алиасы
alias ompc='omp --config ~/.omp/presets/cache-safe.yml'
alias ompq='omp --config ~/.omp/presets/quality.yml'
```

## Правила, без которых пресет не работает

1. Пресет выбирается **до** первого сообщения: он задаёт модель, thinking и режимы.
2. Внутри задачи не переключать модель, thinking, plan/vibe/goal и tool-set.
3. MCP и скиллы — до старта сессии, не в середине.
4. Продолжение — `resume`/fork, не `/new`.
5. `quality.yml` ломает кэш на переходах plan/advisor — это осознанная плата за качество.
