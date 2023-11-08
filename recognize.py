import asyncio
import sys
from shazamio import Shazam


async def main():
  shazam = Shazam()
  file_name=sys.argv[1]
  out = await shazam.recognize_song(file_name)
  if len(out['matches']) == 0:
    print("No match found")
    exit(1)
  else:
    print(out['track']['title'] + " - " + out['track']['subtitle'])

loop = asyncio.get_event_loop()
loop.run_until_complete(main())
