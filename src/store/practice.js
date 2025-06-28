import { defineStore } from 'pinia'

export const usePracticeStore = defineStore('practice', {
  state: () => ({
    startTime: null,
    chars: [],
    userInput: '',
  }),
  actions: {
    start(chars = []) {
      this.chars = chars
      this.userInput = ''
      this.startTime = Date.now()
    },
  },
}) 