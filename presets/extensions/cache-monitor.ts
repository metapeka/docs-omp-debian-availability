/**
 * cache-monitor — hit rate кэша префикса в статус-строке и команда `/cache`.
 *
 * План: docs/plan-cache-modes.md. Ничего не меняет в настройках и запросах:
 * только читает usage завершённого хода (`turn_end.message.usage`) и публикует
 * статус. Предупреждение — когда hit падает ниже 50% не на первом ходе:
 * это и есть признак смены префикса посреди сессии.
 *
 * Установка: скопировать в `~/.omp/agent/extensions/` и включить сегмент
 * `status` в `statusLine.rightSegments` (см. presets/README.md).
 */
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { lookup } from "@oh-my-pi/pi-coding-agent/config/registry";

type TurnUsage = { input: number; cacheRead: number; cost: number };

/** Поле внешнего объекта без `any`: guard проверяет форму, индекс — один общий случай. */
function field(source: unknown, key: string): unknown {
	if (source !== null && typeof source === "object" && key in source) {
		return (source as Record<string, unknown>)[key];
	}
	return undefined;
}

/** Число из события: провайдер обязан прислать число, остальное считаем нулём. */
function num(value: unknown): number {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** Процент кэша от всего prompt: cacheRead / (input + cacheRead). */
function hitPercent(cacheRead: number, input: number): number {
	const total = cacheRead + input;
	return total > 0 ? Math.round((cacheRead / total) * 1000) / 10 : 0;
}

export default function cacheMonitor(pi: ExtensionAPI): void {
	const mode = process.env.OMP_MODE?.trim() || "";
	let last: TurnUsage | null = null;
	let turns = 0;
	let sessionInput = 0;
	let sessionCached = 0;
	let sessionCost = 0;

	pi.on("session_start", (_event, ctx) => {
		if (ctx.hasUI) ctx.ui.setStatus("cache", mode ? `${mode} ↺ …` : "↺ …");
	});

	pi.on("turn_end", (event, ctx) => {
		const raw = field(field(event, "message"), "usage");
		if (raw === null || typeof raw !== "object") return;
		const usage: TurnUsage = {
			input: num(field(raw, "input")),
			cacheRead: num(field(raw, "cacheRead")),
			cost: num(field(field(raw, "cost"), "total")),
		};
		last = usage;
		turns += 1;
		sessionInput += usage.input;
		sessionCached += usage.cacheRead;
		sessionCost += usage.cost;

		const hit = hitPercent(usage.cacheRead, usage.input);
		if (ctx.hasUI) {
			ctx.ui.setStatus("cache", mode ? `${mode} ↺ ${hit}%` : `↺ ${hit}%`);
		}

		const turnIndex = num(field(event, "turnIndex"));
		const prompt = usage.input + usage.cacheRead;
		// Первый ход холодный по определению; мелочь (<4k) не показатель.
		if (ctx.hasUI && turnIndex >= 1 && prompt >= 4000 && hit < 50) {
			ctx.ui.notify(
				`Кэш префикса: hit ${hit}% (input ${usage.input}, cacheRead ${usage.cacheRead}). ` +
					"Префикс изменился посреди сессии — проверьте модель, thinking, режим и MCP.",
				"warning",
			);
		}
	});

	pi.registerCommand("cache", {
		handler: async (_args, ctx) => {
			const model = ctx.model
				? `${String(field(ctx.model, "provider") ?? "?")}/${String(field(ctx.model, "id") ?? "?")}`
				: "?";
			let thinking = "?";
			try {
				// Эффективное значение с учётом слоёв и /effort; runtime-аксессор
				// pi.getThinkingLevel() на 19.1.0 отдаёт не строку.
				const handle = lookup("defaultThinkingLevel");
				const level = handle?.get(pi.pi.settings);
				if (typeof level === "string" && level) thinking = level;
			} catch {
				// реестр недоступен — оставляем «?»
			}
			const lastText = last
				? `ход: ↺ ${hitPercent(last.cacheRead, last.input)}% · in ${last.input} · ` +
					`cached ${last.cacheRead} · $${last.cost.toFixed(4)}`
				: "ходов ещё не было";
			ctx.ui.notify(
				`режим: ${mode || "без пресета"} · ${model} · thinking ${thinking} · ${lastText} · ` +
					`сессия: $${sessionCost.toFixed(4)}, ходов ${turns}, ↺ ${hitPercent(sessionCached, sessionInput)}%`,
				"info",
			);
		},
	});
}
