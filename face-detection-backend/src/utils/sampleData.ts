

export function getSampleCameras(adminId: string) {
    return [
        {
            name: 'Front Door Camera',
            rtspUrl: 'rtsp://demo:demo@ipvmdemo.dyndns.org:5541/onvif-media/media.amp',
            location: 'Main Entrance',
            userId: adminId
        },
        {
            name: 'Parking Lot Camera', 
            rtspUrl: 'rtsp://demo:demo@ipvmdemo.dyndns.org:5542/onvif-media/media.amp',
            location: 'Parking Area',
            userId: adminId,
            enabled: false
        },
        {
            name: 'Reception Area',
            rtspUrl: 'rtsp://wowzaec2demo.streamlock.net/vod-multitrack/_definst_/ElephantsDream/elephantsdream2.mp4',
            location: 'Lobby',
            userId: adminId
        }
    ];
}