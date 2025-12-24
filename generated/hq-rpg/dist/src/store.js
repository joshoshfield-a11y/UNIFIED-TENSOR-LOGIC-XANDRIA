import { create } from 'zustand';
export const useStore = create((set) => ({
  hp: 100,
  xp: 0,
  inventory: [],
  addItem: (item) => set((state) => {
    const div = document.createElement('div');
    div.className = 'slot';
    div.innerText = item.icon;
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