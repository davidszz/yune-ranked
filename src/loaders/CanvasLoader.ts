import { registerFont } from 'canvas';

import type { Yune } from '@client';
import { Logger } from '@services/Logger';
import { Loader } from '@structures/Loader';
import { Assets } from '@utils/Constants';

export class CanvasLoader extends Loader {
	constructor(client: Yune) {
		super(client, {
			preLoad: true,
		});
	}

	async initialize() {
		Logger.info('Registering canvas fonts...');

		// Whitney Family
		registerFont(Assets.font('whitney-bold', 'otf'), { family: 'Whitney', weight: 'bold' });
		registerFont(Assets.font('whitney-semibold', 'otf'), { family: 'Whitney Semibold' });
		registerFont(Assets.font('whitney-medium', 'ttf'), { family: 'Whitney Medium' });
		registerFont(Assets.font('whitney-regular', 'otf'), { family: 'Whitney' });
		registerFont(Assets.font('whitney-light', 'otf'), { family: 'Whitney', weight: 'light' });

		// Montserrat Family
		registerFont(Assets.font('Montserrat-Bold'), { family: 'Montserrat', weight: 'bold' });
		registerFont(Assets.font('Montserrat-Medium'), { family: 'Montserrat Medium' });
		registerFont(Assets.font('Montserrat-Regular'), { family: 'Montserrat' });
		registerFont(Assets.font('Montserrat-Light'), { family: 'Montserrat', weight: 'light' });

		// Poppins Family
		registerFont(Assets.font('Poppins-Bold'), { family: 'Poppins', weight: 'bold' });
		registerFont(Assets.font('Poppins-Medium'), { family: 'Poppins Medium' });
		registerFont(Assets.font('Poppins-Regular'), { family: 'Poppins' });

		// Symbols Fonts
		registerFont(Assets.font('NotoEmoji-Regular'), { family: 'Symbols' });
		registerFont(Assets.font('NotoSans-Regular'), { family: 'Symbols' });
		registerFont(Assets.font('NotoSansSymbols-Regular'), { family: 'Symbols' });
		registerFont(Assets.font('NotoSansSymbols2-Regular'), { family: 'Symbols' });
		registerFont(Assets.font('seguisym'), { family: 'Symbols' });
		registerFont(Assets.font('simsun', 'ttc'), { family: 'Symbols' });

		Logger.success('All fonts has been registered!');
	}
}
