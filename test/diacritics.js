var assert = require('assert');
var diacritics = require('../dist/cjs/diacritics.js');

describe('diacritics', function(){
	this.timeout(10000);

	let prep = diacritics.initialize();

	it('Should match composed and decomposed strings', () => {

		const composed		= 'أهلا'; // '\u{623}\u{647}\u{644}\u{627}'
		const decomposed	= 'أهلا'; // '\u{627}\u{654}\u{647}\u{644}\u{627}'

		assert.notEqual(composed,decomposed);


		let regex = diacritics.regExp(composed);
		assert.equal(regex.test(composed), true);



		regex = diacritics.regExp(decomposed);
		assert.equal(regex.test(decomposed), true);

		regex = diacritics.regExp(composed);
		assert.equal(regex.test(decomposed), true);

		regex = diacritics.regExp(decomposed);
		assert.equal(regex.test(composed), true);

	});


	it('Should match all diacritic code points',()=>{


		for(let i = 0; i <= 65535; i++){

			let composed	= String.fromCharCode(i);
			let decomposed	= composed.normalize('NFKD');


			if( decomposed.length > 3 ){
				continue;
			}

			if( composed.trim().length == 0 ){
				continue;
			}

			let regex = diacritics.regExp(composed);
			if( regex ){
				assert.equal(regex.test(composed), true, 'composed should match composed for ' + composed + ' regex: '+regex + ' code point: '+i);
			}

			regex = diacritics.regExp(decomposed);
			if( regex ){
				assert.equal(regex.test(decomposed), true, 'decomposed should match composed for ' + decomposed + ' and ' + composed + ' regex: '+regex);
			}

			regex = diacritics.regExp(composed);
			if( regex ){
				assert.equal(regex.test(decomposed), true, 'composed should match decomposed for ' + composed + ' and ' + decomposed + ' regex: '+regex);
			}

			regex = diacritics.regExp(decomposed);
			if( regex ){
				assert.equal(regex.test(composed), true, 'decomposed should match composed for ' + decomposed + ' and ' + composed + ' regex: '+regex+ ' code point: '+i);
			}

		};

	});


});
