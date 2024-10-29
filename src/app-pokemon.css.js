import { css, unsafeCSS } from 'lit-element';
import * as foundations from '@bbva-web-components/bbva-foundations-styles';

export default css`
:host {
  display: block;
  box-sizing: border-box;
  background-color: white;
}

:host([hidden]), [hidden] {
  display: none !important;
}

*, *::before, *::after {
  box-sizing: inherit;
}

h1 {
  text-align: center;
  color: #2c3e50;
}

.search-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

input {
  width: 200px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

input:focus {
  border-color: #3498db;
}

.pokemon-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 0 16px;
  position: relative;
  background-color: white;
}

.pokemon-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  background-color: #f9f9f9;
  transition: transform 0.3s ease;
  width: 230px;
}

.pokemon-card:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pokemon-card img {
  width: 80px;
  height: 80px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 16px 0;
}

body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f0f0f0;
}

.evolution-container {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  width: 1270px;
  max-width: 100%;
}

.evolution-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  max-width: 100%;
  margin: 30px auto;
}

.pokemon-text {
  background-color: rgb(55, 170, 223);
  color: black;
  border-radius: 15px;
  padding: 20px;
  font-size: 1.5em;
  line-height: 1.4;
  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.1);
  max-width: auto;
  margin-top: 30px;
  margin-bottom: 30px;
  text-align: center;
}

.evolution-cards {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 16px;
}

.evolution-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  background-color: #f9f9f9;
  transition: transform 0.3s ease;
  width: 400px;
}

.evolution-card:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2);
}

.evolution-card img {
  width: 350px;
  height: 350px;
}

.button-container {
  margin-top: 20px;
  text-align: center;
}
`;
