# Diacritics

Diacritics is a small utility for generating diacritic insensitive regular expressions.


```sh
$ npm install @orchidjs/diacritics
```

## Usage

```js

const stringa   = 'أهلا'; // '\u{623}\u{647}\u{644}\u{627}'
const stringb   = 'أهلا'; // '\u{627}\u{654}\u{647}\u{644}\u{627}'

const regex     = diacritics.regExp(stringa);
const matches   = regex.test(stringb);

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
