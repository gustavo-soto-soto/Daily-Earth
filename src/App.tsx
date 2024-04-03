import { useEffect, useState } from 'react'
import IEarthImage  from './interfaces/IEarthImage.ts'
import './App.css'
import IDailyImage from './interfaces/IDailyImage.ts'
import rocketSVG from './assets/icons/rocket.svg'
import playSVG from './assets/icons/play.svg'
import stopSVG from './assets/icons/stop.svg'

const NASA_API_KEY: string = import.meta.env.VITE_NASA_API_KEY
const EARTH_IMAGES_SERVER: string = import.meta.env.VITE_EARTH_IMAGES_SERVER

const getEarthImageURL = ( imageName: string, imageDate: string, extension: string = "png" ): string => {

  try {
    
    const formatImageName: string = `${imageName}.${extension}`
    const [ year, month, day ] = imageDate.split("-")
  
    const imageURL = `${EARTH_IMAGES_SERVER}/${year}/${month}/${day}/${extension}/${formatImageName}`

    return imageURL 
  } catch (error) {
    console.error(error)
    return ""
  }
}

function App() {
  
  const [earthImages, setEarthImages] = useState<IEarthImage[]>([])
  const [currentImage, setCurrentImage] = useState<string>("")
  const [dailyImage, setDailyImage] = useState<IDailyImage>()

  const [loading, setLoading] = useState<boolean>(false)
  const [play, setPlay] = useState<boolean>(false)
  const handlePlay = () => setPlay( !play )

  const mainImage = earthImages.find( image => image.identifier === currentImage)

  const handleClickImage = (imageId: string) => setCurrentImage(imageId) 

  useEffect( () => { //initial get images

    const getEarthImages = async() => {
      try {
        setLoading(true)
        const response = await fetch(`https://api.nasa.gov/EPIC/api/natural/images?api_key=${NASA_API_KEY}`)
        if (response.ok){
          let images = await response.json()
          images = images.map( ( ( image: IEarthImage ) => {
            const url = getEarthImageURL( image.image , image.date.split(" ")[0], "jpg")
            return {...image, url}
          }))
          setEarthImages( images )
          setCurrentImage( images[0].identifier )
        }
      } catch (error) {
        console.error(error)
      } finally{
        setLoading(false)
      }
    }

    const getDailyImage = async() => {
      try {
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`)
        if (response.ok){
          const image = await response.json()
          setDailyImage(image)
        }
      } catch (error) {
        console.error(error)
      }
    }

    getEarthImages()
    getDailyImage()

  }, [])

  useEffect(() => { //play images interval 

    try {
      
      let interval: NodeJS.Timeout | unknown = null //setInterval type is NodeJS.TimeOut
  
      if (play) {
        interval = setInterval( () => {
          const currentImageIndex = earthImages.findIndex( image => image.identifier === mainImage?.identifier)
          const nextImageIndex = currentImageIndex+1 === earthImages.length ? 0 : currentImageIndex+1
          handleClickImage( earthImages[nextImageIndex].identifier )
        }, 500);
      } else {
        clearInterval(interval as NodeJS.Timeout);
      }
  
      return () => {
        if (interval) clearInterval( interval as NodeJS.Timeout);
      };

    } catch (error) {
      console.error(error)
    }

  }, [play, earthImages, mainImage]);

  if (loading) 
    return (
      <div className='loading-screen'>
         <img 
          src={rocketSVG}
          className='slide-in-top' 
          alt={`Loading...`} 
          width={200} 
          height={200} 
          loading='eager'
        />
      </div>
    )

  return (
    <main className='main-container'>

      <div className='header-container'>
        <h1>Daily Earth</h1>
        <p>Take a look at the daily Earth photos and the space news of the day</p>
      </div>

      <div className='earth-images-container'>

        <div className='carousel-container'>
          {
            earthImages.map( ( { identifier, date, url, centroid_coordinates } ) => (
              <div 
                key={identifier} 
                className={'carousel-item ' + (identifier === mainImage?.identifier && 'current-image') }
                onClick={ () => { handleClickImage(identifier) } }
              >
                <div className='carousel-image-container'>
                  <img src={url} className='carousel-image ' alt={`Daily earth image ${date}`} width={300} height={300} loading='lazy'/>
                </div>
                <div className='carousel-image-info'>
                  <h2> { date } </h2>
                  <span> { Object.values(centroid_coordinates).join(", ") } </span>
                </div>
              </div>
            ))
          }
        </div>
        
        <div className='main-image-container'>
          <div className='shadow-image rotate-center'>
            <img 
              src={mainImage?.url ?? ""}
              className='main-image' 
              alt={`Daily earth image ${mainImage?.date ?? ""}`} 
              width={300} 
              height={300} 
              loading='lazy'
            />
          </div>

          <div className='main-image-info'>

            <h2 className='main-image-title'>{ mainImage?.caption } on {mainImage?.date}</h2>

            <h3 className='main-image-name'>Image Name: { mainImage?.image }</h3>

            <h4 className='main-image-coordinates'>Earth Coordinates: </h4>

            <div className='image-coordinates-container'>
              <span><b>Lat: </b> { mainImage?.centroid_coordinates.lat }</span>
              <span><b>Lon: </b> { mainImage?.centroid_coordinates.lon }</span>
            </div>

            <h4 className='main-image-coordinates'>Camera Position: </h4>

            <div className='image-coordinates-container'>
              <span> <b>X: </b>{ mainImage?.dscovr_j2000_position.x }</span>
              <span> <b>Y: </b>{ mainImage?.dscovr_j2000_position.y }</span>
              <span> <b>Z: </b>{ mainImage?.dscovr_j2000_position.z }</span>
            </div>

          </div>

        </div>

        <div className='tools-container'>
          <button className='play-button' onClick={handlePlay} >
            { play ? 'STOP' : 'PLAY' } 
            <img 
              src={ play ? stopSVG : playSVG }
              className='play-svg' 
              alt={'Play svg'} 
              width={20} 
              height={20} 
            />
          </button>
          
        </div>

      </div>

      <div className='daily-container'>

        <div className='header-daily-image'>
          <h1>Astronomy Picture of the Day</h1>
          <h2>Title: {dailyImage?.title}</h2>
          <span>{dailyImage?.date}</span>
          <p title={dailyImage?.explanation}>{dailyImage?.explanation} </p>
        </div>
        
        <div className='daily-image-container'>
          <img 
            src={dailyImage?.url}
            className='daily-image' 
            alt={`Daily image of the day`} 
            loading='lazy'
          /> 
        </div>

      </div>

    </main>
  )
}

export default App
