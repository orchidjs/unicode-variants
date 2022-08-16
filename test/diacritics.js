var assert = require('assert');
var diacritics = require('../dist/cjs/diacritics.js');


describe('diacritics', function(){

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


	it('Should match all code points individually',()=>{

		const regExp = (needle) => {
			needle = '^'+diacritics.diacriticRegexPoints(needle)+'$';
			return new RegExp(needle,'iu')
		};

		diacritics.code_points.forEach((code_range)=>{

			for(let i = code_range[0]; i <= code_range[1]; i++){


				let composed	= String.fromCharCode(i);
				let decomposed	= diacritics.decompose(composed);
				let folded		= diacritics.asciifold(composed);

				if( folded.length == 0 ){
					continue;
				}

				if( decomposed.length > 3 ){
					continue;
				}

				if( composed.trim().length == 0 ){
					continue;
				}

				let regex = regExp(composed);
				if( regex ){
					assert.equal(regex.test(composed), true, 'composed should match composed for composed: ' + composed + ', decomposed: ' + decomposed + ', regex: '+regex+' code point: '+i);
					assert.equal(regex.test(decomposed), true, 'composed should match decomposed for composed: ' + composed + ', decomposed: ' + decomposed + ', regex: '+regex+' code point: '+i);
				}


				regex = regExp(decomposed);
				if( regex ){
					assert.equal(regex.test(decomposed), true, 'decomposed should match composed for composed: ' + composed + ', decomposed: ' + decomposed + ', regex: '+regex+' code point: '+i);
					assert.equal(regex.test(composed), true, 'decomposed should match composed for composed: ' + composed + ', decomposed: ' + decomposed + ', regex: '+regex+' code point: '+i);
				}

			};
		});

	});


	it('Should match all code points in strings',()=>{

		diacritics.code_points.forEach((code_range)=>{

			let composeda	= [];
			let decomposeda	= [];
			let code_points	= [];

			for(let i = code_range[0]; i < code_range[1]; i++){

				let char			= String.fromCharCode(i);
				let char_decompsed	= diacritics.decompose(char);
				let folded			= diacritics.asciifold(char);

				if( folded.length == 0 ){
					continue;
				}

				if( char_decompsed.length > 3 ){
					continue;
				}

				if( char.trim().length == 0 ){
					continue;
				}

				code_points.push(i);
				composeda.push(char);
				decomposeda.push(char_decompsed);

				if( composeda.length >= 2 ){

					let composed = composeda.join('');
					let decomposed = decomposeda.join('');

					let regex = diacritics.regExp(composed);
					if( regex ){
						assert.equal(regex.test(composed), true, `composed should match composed for composed: ${composeda}, decomposed: ${decomposeda} regex: ${regex} code points: ${code_points}`);
						assert.equal(regex.test(decomposed), true, `composed should match composed for composed: ${composeda}, decomposed: ${decomposeda} regex: ${regex} code points: ${code_points}`);
					}

					regex = diacritics.regExp(decomposed);
					if( regex ){
						assert.equal(regex.test(decomposed), true, `composed should match composed for composed: ${composeda}, decomposed: ${decomposeda} regex: ${regex} code points: ${code_points}`);
						assert.equal(regex.test(composed), true, `composed should match composed for composed: ${composeda}, decomposed: ${decomposeda} regex: ${regex} code points: ${code_points}`);
					}

					composeda	= [];
					decomposeda	= [];
					code_points	= [];

				}

			}



		});

	});


});
