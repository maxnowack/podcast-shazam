import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { parallel } from 'radash'
import executeCommand from './executeCommand'

function sha256(input: string) {
  const hashFn = createHash('sha256')
  hashFn.update(input)
  return hashFn.digest('hex')
}

const fileName = process.argv[2]
const hash = sha256(fileName)

const dataDir = path.join(process.cwd(), 'tmp', hash)
const start = async () => {
  await fs.promises.mkdir(dataDir, { recursive: true })
  await executeCommand(`ffmpeg -i ${fileName} -f segment -segment_time 15 -c copy ${path.join(dataDir, 'out%03d.mp3')}`)
  const files = await fs.promises.readdir(dataDir)
  const output = await parallel(10, files, async (file) => {
    const song = await executeCommand(`python recognize.py ${path.join(dataDir, file)}`)
      .then(i => i.trim())
      .catch(() => null)
    if (song) console.log('got song', file, song)
    return { file, song }
  })

  const uniqueSongs = [...new Set(output.map(i => i.song).filter(i => i))]
  console.log(uniqueSongs)
}

start().catch(console.error)
