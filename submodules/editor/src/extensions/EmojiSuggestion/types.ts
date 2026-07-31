export interface EmojiItem {
  name: string
  emoji: string
  fallbackImage?: string
}

export interface Command {
  name: string
}

export interface EmojiListProps {
  command: (command: Command) => void
  items: EmojiItem[]
}
