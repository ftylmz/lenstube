import 'plyr-react/dist/plyr.css'

import imageCdn from '@utils/functions/imageCdn'
import clsx from 'clsx'
import { APITypes, PlyrInstance, PlyrProps, usePlyr } from 'plyr-react'
import React, { FC, forwardRef, useEffect, useState } from 'react'

import PlayerContextMenu from './PlayerContextMenu'

interface Props {
  source: string
  wrapperClassName?: string
  poster: string
  controls?: string[]
  autoPlay?: boolean
  ratio?: string
  time?: number
}

interface customPlyrProps extends PlyrProps {
  time?: number
}

export const defaultPlyrControls = [
  'play-large',
  'play',
  'progress',
  'current-time',
  'mute',
  'volume',
  'captions',
  'settings',
  'pip',
  'airplay',
  'fullscreen',
  'disableContextMenu'
]

const CustomPlyrInstance = forwardRef<APITypes, customPlyrProps>(
  ({ source, options, time }, ref) => {
    const raptorRef = usePlyr(ref, { options, source })
    const [showContextMenu, setShowContextMenu] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
      const { current } = ref as React.MutableRefObject<APITypes>
      if (current.plyr.source === null) return
      const api = current as { plyr: PlyrInstance }

      api.plyr.on('ready', () => {
        api.plyr.currentTime = Number(time || 0)
      })

      const onDataLoaded = () => {
        api.plyr.off('loadeddata', onDataLoaded)
        api.plyr.currentTime = Number(time || 0)
      }
      // Set seek time when meta data fully downloaded
      api.plyr.on('loadedmetadata', onDataLoaded)
    })

    const onContextClick = (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      setShowContextMenu(false)
      const newPosition = {
        x: event.pageX,
        y: event.pageY
      }
      setPosition(newPosition)
      setShowContextMenu(true)
    }

    return (
      <div onContextMenu={onContextClick}>
        <video
          ref={raptorRef as React.MutableRefObject<HTMLVideoElement>}
          className="plyr-react plyr"
        />
        {showContextMenu && (
          <PlayerContextMenu
            position={position}
            ref={ref}
            hideContextMenu={() => setShowContextMenu(false)}
          />
        )}
      </div>
    )
  }
)

CustomPlyrInstance.displayName = 'CustomPlyrInstance'

const VideoPlayer: FC<Props> = ({
  source,
  controls = defaultPlyrControls,
  poster,
  autoPlay = true,
  ratio = '16:9',
  wrapperClassName,
  time
}) => {
  const ref = React.useRef<APITypes>(null)

  const options = {
    controls: controls,
    autoplay: autoPlay,
    autopause: true,
    tooltips: { controls: true, seek: true },
    ratio
  }

  return (
    <div
      className={clsx('wrapper overflow-hidden rounded-xl', wrapperClassName)}
    >
      <CustomPlyrInstance
        ref={ref}
        source={{
          type: 'video',
          sources: [
            {
              src: source,
              provider: 'html5'
            }
          ],
          poster: imageCdn(poster) ?? source
        }}
        options={options}
        time={time}
      />
    </div>
  )
}

export default VideoPlayer
