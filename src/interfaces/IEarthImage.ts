export default interface IEarthImage  {
    identifier: string
    caption: string
    image: string
    version: string
    date: string
    url?: string
    centroid_coordinates: {
        lat: string,
        lon: string
    }
    dscovr_j2000_position: {
        x: string,
        y: string,
        z: string
    }
}