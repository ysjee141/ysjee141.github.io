const excerpt = (str: string, length: number) => {
  return str
    .replace(/[\r\n\s]+/g, ' ').trim()
    .substring(0, length) + '...'
}

const tags = (tags: string[]) => {
  return (tags instanceof Array) ? tags.join(', ') : tags;
}

export {excerpt, tags}