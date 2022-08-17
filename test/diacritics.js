var assert = require('assert');
var diacritics = require('../dist/cjs/diacritics.js');


describe('diacritics', function(){

	let prep = diacritics.initialize();

	/**
	 * @param {string[]} combos
	 */
	const testCombos = (combos) => {

		for( let stra of combos ){
			let regex = diacritics.regExp(stra);

			for( let strb of combos ){
				assert.equal(regex.test(strb), true, `stra ${stra} strb ${strb} regex ${regex}`);
			}
		}
	};

	// "TM" should match ™, ⓉM ...
	it('Matching "TM"', () => {
		let combos = ['TM','tm','™','ⓉM','Tℳ'];
		testCombos(combos);
	});

	// RSM should match "₨","M" or "R","℠"
	it('Matching "RSM"', () => {
		let combos = ['RSM','₨M','R℠'];
		testCombos(combos);
	});


	it('Matching "1/4"', () => {
		let combos = ['1/4','⅟4','¼'];
		testCombos(combos);
	});


	it('Should match all code points individually',()=>{

		const regExp = (needle) => {
			needle = '^'+diacritics.diacriticRegexPoints(needle)+'$';
			return new RegExp(needle,'iu')
		};

		for( let value of diacritics.generator(diacritics.code_points) ){

			let composed	= value.composed;
			let folded		= value.folded;
			let i			= value.code_point;

			if( folded.length == 0 ){
				continue;
			}

			let regex = regExp(composed);
			if( regex ){
				assert.equal(regex.test(composed), true, 'composed should match composed for composed: ' + composed + ', folded: ' + folded + ', regex: '+regex+' code point: '+i);
				assert.equal(regex.test(folded), true, 'composed should match folded for composed: ' + composed + ', folded: ' + folded + ', regex: '+regex+' code point: '+i);
			}


			regex = regExp(folded);
			if( regex ){
				assert.equal(regex.test(folded), true, 'folded should match composed for composed: ' + composed + ', folded: ' + folded + ', regex: '+regex+' code point: '+i);
				assert.equal(regex.test(composed), true, 'folded should match composed for composed: ' + composed + ', folded: ' + folded + ', regex: '+regex+' code point: '+i);
			}

		};


	});


	it('Should match all code points in strings',()=>{

		let composeda	= [];
		let decomposeda	= [];
		let code_points	= [];

		for( let value of diacritics.generator(diacritics.code_points) ){

			code_points.push(value.code_point);
			composeda.push(value.composed);
			decomposeda.push(value.folded);

			if( composeda.length < 2 ){
				continue;
			}


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


	});


});
