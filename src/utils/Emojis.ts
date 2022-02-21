export const Emojis = {
	Unranked: '<:unranked:936795758710095902>',
	Iron: '<:iron:936795758693335050>',
	Bronze: '<:bronze:936795758617821194>',
	Silver: '<:silver:936795758680760350>',
	Gold: '<:gold:936795758378770494>',
	Platinum: '<:platinum:936795758672351262>',
	Diamond: '<:diamond:936795758731071598>',
	Master: '<:master:936795758802374657>',
	GrandMaster: '<:grand_master:936795758647197716>',
	Challenger: '<:challenger:936795758668169226>',
	EmptyUser: '<:empty_user:936917351918604298>',
	AcceptedUser: '<:accepted_user:936917351918628914>',
	Join: '<:join:936935440307613716>',
	Left: '<:left:936935440257269770>',
	ToggleOn: '<:toggle_on:937221783604584458>',
	ToggleOff: '<:toggle_off:937221783604563988>',
	Crown: '<:icrown:943643271299735602>',
	TeamBlue: '<:team_blue:944303523171016705>',
	TeamRed: '<:team_red:944303523267493938>',
	Copy: '<:copy_paste:945130219730255922>',
	Info: '<:info:945132548609155132>',
	InfoIn: '<:info_in:945387615287377950>',
	InfoFo: '<:info_fo:945387615190921226>',
};

export const EmojisIds = Object.fromEntries(
	Object.entries(Emojis).map((x) => [x[0], x[1].replace(/<(a)?:.*:(\d+)>/gi, '$2')])
) as Record<keyof typeof Emojis, string>;
