import math
current=(34.7835,135.5245)
places=[
    (34.7832,135.5233),
    (34.7846,135.5268),
    (34.7811,135.5252),
    (34.7825,135.5205),
    (34.7852,135.5280),
    (34.78,135.524),
    (34.7839,135.5294),
]
for p in places:
    lat1, lon1 = current
    lat2, lon2 = p
    toRad = lambda v: v * math.pi / 180
    dLat = toRad(lat2 - lat1)
    dLon = toRad(lon2 - lon1)
    R = 6371000
    a = math.sin(dLat/2) ** 2 + math.cos(toRad(lat1)) * math.cos(toRad(lat2)) * math.sin(dLon/2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    print(round(R*c))
