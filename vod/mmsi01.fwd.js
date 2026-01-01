/**
 * Forward Plugin - mmsi01
 * Author: you
 * Type: m3u8 direct
 */

const cheerio = createCheerio()

const UA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'

let appConfig = {
    ver: 1,
    title: 'mmsi01',
    site: 'https://mmsi01.com',
}

/* ===================== 基础配置 ===================== */

async function getConfig() {
    return jsonify(appConfig)
}

/* ===================== 详情 → 播放列表 ===================== */

async function getTracks(ext) {
    ext = argsify(ext)

    return jsonify({
        list: [
            {
                title: '默认线路',
                tracks: [
                    {
                        name: '播放',
                        ext: {
                            url: ext.url, // https://mmsi01.com/e/xxxx
                        },
                    },
                ],
            },
        ],
    })
}

/* ===================== 播放解析 ===================== */

async function getPlayinfo(ext) {
    ext = argsify(ext)

    const playPage = ext.url

    const { data } = await $fetch.get(playPage, {
        headers: {
            'User-Agent': UA,
            'Referer': appConfig.site,
        },
    })

    // 直接提取 m3u8
    const m3u8 = data.match(
        /(https:\/\/mmsi01\.com\/stream\/[^"'\\]+\.m3u8[^"'\\]*)/
    )?.[1]

    if (!m3u8) {
        throw new Error('mmsi01: 未找到 m3u8')
    }

    return jsonify({
        urls: [
            {
                url: m3u8,
                headers: {
                    'User-Agent': UA,
                    'Referer': appConfig.site,
                },
            },
        ],
    })
}

/* ===================== 搜索（不支持） ===================== */

async function search() {
    return jsonify({ list: [] })
}
