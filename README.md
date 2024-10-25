# @meraki/app-pokemon

## Package info

### Package installation

Installation using NPM

```bash
npm install @meraki/app-pokemon
```

### Entry points & exports

- (Default entry point)
  - AppPokemon (Class)
- app-pokemon.js
  - app-pokemon (Custom Element)


## AppPokemon (Class) app-pokemon (Custom Element) 

### Extends from

LitElement (lit-element package)

### Usage

Import and extend the class:

```js
import { AppPokemon } from '@meraki/app-pokemon';

class ExampleElement extends AppPokemon {
  ...
}
```

Use the custom element (defined globally):

```js
import '@meraki/app-pokemon/app-pokemon.js';
```

```html
<app-pokemon ...>
  ...
</app-pokemon>
```

### Description

![LitElement component](https://img.shields.io/badge/litElement-component-blue.svg)

This component ...

Example:

```html
  <app-pokemon></app-pokemon>
```

### Properties

- **name**: string = "Cells" (attribute: name)
    Description for property
