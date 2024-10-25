import { LitElement, html, css } from 'lit-element';
import styles from './app-pokemon.css.js';
import '@bbva-web-components/bbva-web-button-default/bbva-web-button-default.js';
import '@bbva-web-components/bbva-progress-content/bbva-progress-content.js';
import '@bbva-web-components/bbva-help-modal/bbva-help-modal.js'


export class AppPokemon extends LitElement {
  
  static get properties() {
    return {
      pokemons: { type: Array },
      currentPage: { type: Number },
      searchQuery: { type: String },
      totalPokemons: { type: Number },
      perPage: { type: Number },
      searchResults: { type: Array },
      selectedEvolutions: { type: Array },
      loading: {type: Boolean},
      detailOpened: {type: Boolean, attribute: false,},
    };
  }

  constructor() {
    super();
    this.pokemons = [];
    this.currentPage = 1;
    this.searchQuery = '';
    this.totalPokemons = 0;
    this.perPage = 10;
    this.selectedEvolutions = null;
    this.searchResults = [];
    this.isModalOpen = false;
    this.modalMessage = '';
  }

  static get styles() {
    return [
      styles,
    ]; 
  }

  async fetchPokemons() {
    const offset = (this.currentPage - 1) * this.perPage;

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${this.perPage}&offset=${offset}`);

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }
      const data = await response.json();

      const detailedPokemons = await Promise.all(data.results.map(async(pokemon) => {
        const pokemonResponse = await fetch(pokemon.url);
        if (!pokemonResponse.ok) {
          throw new Error(`Error al obtener datos de Pokémon: ${pokemonResponse.status}`);
        }
        return await pokemonResponse.json();
      }));

      this.pokemons = detailedPokemons;
      this.pokemons.sort((a, b) => a.weight - b.weight);
      this.totalPokemons = data.count;

      this.dispatchEvent(new CustomEvent('my-data-request-success', {
        detail: { pokemons: this.pokemons, total: this.totalPokemons },
        bubbles: true,
        composed: true
      }));

    } catch (error) {
      console.error('Error en fetchPokemons:', error);

      this.dispatchEvent(new CustomEvent('my-data-request-failure', {
        detail: error,
        bubbles: true,
        composed: true
      }));
    }
  }

  willBeActive(active) {
    if (active) {
      this.fetchPokemons();
    } else {
      this.reset();
    }
  }

  async searchPokemons() {
    if (this.searchQuery.length < 1) {
      this.pokemons = [];
      return;
    }
  
    const idQuery = parseInt(this.searchQuery);

    if (!isNaN(idQuery)) {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${idQuery}`);
        if (response.ok) {
          this.pokemons = [await response.json()]; 
        } else {
          this.pokemons = [];
        }
      } catch (error) {
        console.error('Error al buscar Pokémon por ID:', error);
        this.pokemons = [];
      }
    } else {
      try {
        const allPokemonsResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const allPokemons = await allPokemonsResponse.json();
  
        this.pokemons = await Promise.all(allPokemons.results
          .filter(pokemon => pokemon.name.startsWith(this.searchQuery.toLowerCase()))
          .map(async pokemon => {
            const pokemonResponse = await fetch(pokemon.url);
            return pokemonResponse.ok ? await pokemonResponse.json() : null;
          })
        );
      } catch (error) {
        console.error('Error al buscar Pokémon por nombre:', error);
        this.pokemons = [];
      }
    }
  }
  

  handleInput(ev) {
    this.searchQuery = ev.target.value;
    this.searchPokemons();
  }

  async changePage(page) {
    this.currentPage = page;
    await this.fetchPokemons();
  }

  async nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      await this.fetchPokemons();
    }
  }

  async prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      await this.fetchPokemons();
    }
  }

  get totalPages() {
    return Math.ceil(this.totalPokemons / this.perPage);
  }

  get visiblePages() {
    const total = this.totalPages;
    const pages = [];
    const startPage = Math.max(1, this.currentPage - 1);
    const endPage = Math.min(total, this.currentPage + 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  async fetchEvolutionChain(pokemon) {
    try {
      const speciesResponse = await fetch(pokemon.species.url);
      const speciesData = await speciesResponse.json();

      if (speciesData.evolution_chain) {
        const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionChainData = await evolutionChainResponse.json();
        return evolutionChainData;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener la cadena de evolución:", error);
      return null;
    }
  }

  async showEvolution(pokemon) {
    const evolutionChain = await this.fetchEvolutionChain(pokemon);
    if (evolutionChain) {
      const evolutions = await this.getEvolutions(evolutionChain.chain);
        this.selectedEvolutions = evolutions;
    } 
  }

  async getEvolutions(chain) {
    const evolutions = [];
    let current = chain;
  
    while (current) {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${current.species.name}`);
      if (response.ok) {
        const pokemonData = await response.json();
        evolutions.push(pokemonData);
      }
      current = current.evolves_to[0] || null; 
    }
    return evolutions;
  }
  

  goBackToList() {
    this.selectedEvolutions = null;
  }

  firstUpdated() {
    this.fetchPokemons();
  }

  async _submit(pokemon, ev) {
    ev.preventDefault(); 
    this.loading = true; 

    setTimeout(async () => {
        try {
            const evolutionChain = await this.fetchEvolutionChain(pokemon);
            if (evolutionChain) {
                const evolutions = await this.getEvolutions(evolutionChain.chain);
                
                
                if (evolutions.length > 1) {
                    this.showEvolution(pokemon)
                } else {
                    
                    this.showErrorModal('Some Pokémon have not evolved yet or there is no record of their evolution. We invite you to search for another Pokémon that has an evolution.');
                }
            } 
        } catch (error) {
            console.error("Error al mostrar la evolución:", error);
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
    }
  }

  closeModal() {
    const modal = this.shadowRoot.getElementById('modal-error');
    if (modal) {
      modal.close();
    }
    this.isModalOpen = false;
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
        
                <bbva-web-button-default @click="${(ev) => this._submit(pokemon, ev)}">
                  Show Evolution
                </bbva-web-button-default>
              </div>
            `)}
          </div>
        </div>
        `}

       <div class="pagination">
        <bbva-web-button-default @click="${this.prevPage}" ?disabled="${this.currentPage === 1}">Previous</bbva-web-button-default>
          ${this.visiblePages.map(page => html`
        <bbva-web-button-default @click="${() => this.changePage(page)}" class="${page === this.currentPage ? 'active' : ''}">${page}</bbva-web-button-default>
        `)}
        <bbva-web-button-default @click="${this.nextPage}" ?disabled="${this.currentPage === this.totalPages}">Next</bbva-web-button-default>
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
        header-show-left-icon
        header-left-icon-aria-label="padlock"
        title-text="Evolution"
        body-text="${this.modalMessage}"
        subtitle-text="Evolution Information"
        secondary-link-text="Link"
        illustration="success"
        button-text="Close"
        @bbva-help-modal-button-click="${this.closeModal}">
      </bbva-help-modal>

    `;
  }
}

