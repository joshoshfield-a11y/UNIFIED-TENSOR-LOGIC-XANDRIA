import { create } from 'zustand';
import initialData from './data.json';

export const useStore = create((set) => ({
  hp: initialData.stats.hp,
  xp: 0,
  inventory: initialData.inventory || [],
  quests: initialData.quests || [],
  addItem: (item) => set((state) => {
    const div = document.createElement('div');
    div.className = 'slot';
    div.innerText = item.icon || (item.type === 'weapon' ? '⚔️' : '🧪');
    div.title = item.name;
    div.onclick = () => alert(`Used ${item.name}`);
    document.getElementById('inv').appendChild(div);
    return { inventory: [...state.inventory, item], xp: state.xp + 50 };
  }),
  damage: (amount) => set((state) => {
    const newHp = Math.max(0, state.hp - amount);
    document.getElementById('hp').innerText = newHp;
    return { hp: newHp };
  })
}));