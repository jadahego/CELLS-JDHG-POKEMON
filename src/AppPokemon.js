import { LitElement, html } from 'lit-element';
import styles from './app-pokemon.css.js';
import '@bbva-web-components/bbva-web-button-default/bbva-web-button-default.js';
import '@bbva-web-components/bbva-progress-content/bbva-progress-content.js';
import '@bbva-web-components/bbva-help-modal/bbva-help-modal.js'
import '@meraki/pokemon-dm/pokemon-dm.js'


export class AppPokemon extends LitElement {

    static get properties() {
        return {
            pokemons: { type: Array },
            searchResults: { type: Array },
            selectedEvolutions: { type: Array },
            searchQuery: { type: String },
            currentPage: { type: Number },
            totalPokemons: { type: Number },
            perPage: { type: Number },
            loading: { type: Boolean },
        };
    }

    constructor() {
        super();
        this.pokemons = [];
        this.currentPage = 1;
        this.searchQuery = '';
        this.totalPokemons = 0;
        this.perPage = 10;
        this.selectedEvolutions = [];
        this.searchResults = [];
        this.loading = false;
        this.isModalOpen = false;
        this.visiblePages = [1,2];
    }

    static get styles() {
        return [
            styles,
        ];
    }
   
    async firstUpdated() {
        const queryScope = this.shadowRoot || this;
        this._dm = queryScope.querySelector('pokemon-dm');
        await this._dm.fetchPokemons();
        this.updateState();
}

    updateState() {
        this.pokemons = this._dm.pokemons;
        this.currentPage = this._dm.currentPage;
        this.totalPages = this._dm.totalPages;
        this.visiblePages = this._dm.visiblePages;
        this._dm.searchQuery = this.searchQuery
        this.selectedEvolutions = this._dm.selectedEvolutions
        this.requestUpdate();
    }

    async changePage(delta) {
        await this._dm.changePage(delta);
        this.updateState();
    }
 
    async handleInput(ev) {
        this.searchQuery = ev.target.value;
        this.updateState();
        await this._dm.searchPokemons()
        this.updateState();
    }

    
    goBackToList() {
        this._dm.selectedEvolutions = null;
        this.updateState();
    }

    async submitPokemon(pokemon, ev) {
        ev.preventDefault();
        this.loading = true;

        setTimeout(async () => {
            try {
                const evolutionChain = await this._dm.fetchEvolutionChain(pokemon);
                if (evolutionChain) {
                    const evolutions = await this._dm.getEvolutions(evolutionChain.chain);

                    if (evolutions.length > 1) {
                        await this._dm.showEvolution(pokemon)
                        this.updateState();
                    } else {
                        this.showErrorModal('Some Pokémon have not evolved yet or there is no record of their evolution. We invite you to search for another Pokémon that has an evolution.');
                    }
                }
            } catch (error) {
                this.showErrorModal('Ha ocurrido un error inesperado. Por favor, intenta de nuevo.');
            } finally {
                this.loading = false;
            }
        }, 300);
    }

    showErrorModal(message) {
        this.modalMessage = message;
        this.isModalOpen = true;

        const modal = this.shadowRoot.getElementById('modal-error');
        if (modal) {
            modal.bodyText = this.modalMessage;
            modal.open();
        } else {
            this.isModalOpen = false;
        }
    }

    render() {
        return html`
          <div>
            <h1>Pokémon App</h1>
    
            <div class="search-bar">
              <input id="searchInput" type="text" placeholder="Search by ID or Name" @input="${this.handleInput}">
            </div>
    
            ${this.loading ? html`
              <bbva-progress-content visible></bbva-progress-content>
            ` : html`
              <div class="pokemon-container">
                <div class="pokemon-list">
                  ${this.pokemons.map(pokemon => html`
                    <div class="pokemon-card">
                      <h2>${pokemon.name}</h2>
                      <img src="${pokemon.sprites.other.dream_world.front_default}" alt="${pokemon.name}">
                      <p>Height: ${pokemon.height}</p>
                      <p>Weight: ${pokemon.weight}</p>
                      <p>Type: ${pokemon.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
                      <bbva-web-button-default @click="${(ev) => this.submitPokemon(pokemon, ev)}">
                        Show Evolution
                      </bbva-web-button-default>
                    </div>
                  `)}
                </div>
              </div>
            `}
    
            <div class="pagination">
              <bbva-web-button-default 
                @click="${() => this.changePage(-1)}" 
                ?disabled="${this.currentPage === 1}">
                Previous
              </bbva-web-button-default>
    
              ${this.visiblePages.map(page => html`
                <bbva-web-button-default 
                  @click="${() => this.changePage(page - this.currentPage)}" 
                  class="${page === this.currentPage ? 'active' : ''}">
                  ${page}
                </bbva-web-button-default>
              `)}
    
              <bbva-web-button-default 
                @click="${() => this.changePage(1)}" 
                ?disabled="${this.currentPage === this.totalPages}">
                Next
              </bbva-web-button-default>
            </div>
    
            <div class="evolution-container ${this.selectedEvolutions ? 'show-evolution' : 'evolution-overlay'}">
              ${this.selectedEvolutions && this.selectedEvolutions.length > 0 ? html`
                <div class="evolution-content">
                  <h1>Evolution Pokemon</h1>
                  <div class="pokemon-text">
                    ¡Pokémon evolutions are like watching your little friend go from cute to fearsome! Just a couple of levels, a flash of light, and boom! Now you have a powerful beast that can shoot bolts and crush rivals. It's the magic of levels and stats skyrocketing!
                  </div>
                  <div class="evolution-cards">
                    ${this.selectedEvolutions.map(evolution => html`
                      <div class="evolution-card">
                        <h3>${evolution.name}</h3>
                        <img src="${evolution.sprites.other.dream_world.front_default}" alt="${evolution.name}">
                        <p>Height: ${evolution.height}</p>
                        <p>Weight: ${evolution.weight}</p>
                        <p>Type: ${evolution.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
                      </div>
                    `)}
                  </div>
                  <div class="button-container">
                    <bbva-web-button-default @click="${this.goBackToList}">Previous</bbva-web-button-default> 
                  </div>
                </div>
              ` : ''}
            </div>
    
            <bbva-help-modal
              id="modal-error"
              title-text="Evolution"
              body-text="${this.modalMessage}"
              illustration="success"
              button-text="Close"
              @bbva-help-modal-button-click="${this.close}">
            </bbva-help-modal>
    
            <pokemon-dm></pokemon-dm>
          </div>
        `;
    }
    
}

