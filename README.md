# Diacritics
[![Build Status](https://img.shields.io/travis/com/orchidjs/diacritics)](https://travis-ci.com/github/orchidjs/diacritics)
[![Coverage Status](http://img.shields.io/coveralls/orchidjs/diacritics/master.svg?style=flat)](https://coveralls.io/r/orchidjs/diacritics)
<a href="https://www.npmjs.com/package/@orchidjs/diacritics" class="m-1 d-inline-block"><img alt="npm (scoped)" src="https://img.shields.io/npm/v/@orchidjs/diacritics?color=007ec6"></a>

Diacritics is a small utility for generating diacritic insensitive regular expressions.


```sh
$ npm install @orchidjs/diacritics
```

## Example

```js

const stringa   = 'أهلا'; // '\u{623}\u{647}\u{644}\u{627}'
const stringb   = 'أهلا'; // '\u{627}\u{654}\u{647}\u{644}\u{627}'

// without @orchidjs/diacritics
let regex       = new RegExp(stringa);
console.log(regex.test(stringa)); // true
console.log(regex.test(stringb)); // false

// with @orchidjs/diacritics
regex           = diacritics.regExp(stringa);
console.log(regex.test(stringa)); // true
console.log(regex.test(stringb)); // true

```

## Contributing

Install the dependencies that are required to build and test:

```sh
$ npm install
```

Build from typescript
```sh
$ npm run build
```

Run tests
```sh
$ npm test
```

## License

Copyright &copy; 2013–2021 [Contributors](https://github.com/orchidjs/diacritics/graphs/contributors)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
