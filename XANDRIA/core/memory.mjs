import { readVault, writeVault } from '../tools/xandria/vault.mjs';

export class Memory {
  constructor() {
    this.state = readVault();
  }
  get(key, def) {
    return Object.prototype.hasOwnProperty.call(this.state, key) ? this.state[key] : def;
  }
  set(key, value) {
    this.state[key] = value;
    return this;
  }
  save() {
    writeVault(this.state);
  }
}

