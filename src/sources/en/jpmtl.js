import cheerio from "react-native-cheerio";

import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "https://jpmtl.com/";

const popularNovels = async (page) => {
    let url =
        "https://jpmtl.com/v2/book/show/browse?query=&categories=&content_type=0&direction=0&page=2&limit=20&type=5&status=all&language=3&exclude_categories=";

    const result = await fetch(url);
    const body = await result.json();

    let novels = [];

    body.map((item) => {
        const novelName = item.title;
        const novelCover = item.cover;
        const novelUrl = item.id + "/";

        const novel = { sourceId: 14, novelName, novelCover, novelUrl };

        novels.push(novel);
    });

    return novels;
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}books/${novelUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 14;

    novel.sourceName = "JPMTL";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $("h1.book-sidebar__title").text();

    novel.novelCover = $(".book-sidebar").find("img").attr("src");

    $(".post-content_item").each(function (result) {
        detailName = $(this)
            .find(".summary-heading > h5")
            .text()
            .replace(/[\t\n]/g, "")
            .trim();
        detail = $(this)
            .find(".summary-content")
            .text()
            .replace(/[\t\n]/g, "")
            .trim();

        novel[detailName] = detail;
    });

    novel.summary = $(".main-book__synopsis").text();

    novel.genre = "";

    $("a.main-book__category").each(function (result) {
        novel.genre += $(this).text();
    });

    novel.author = $(".book-sidebar__author > .book-sidebar__info")
        .text()
        .replace(/[\t\n]/g, "")
        .trim();

    let novelChapters = [];

    const chapterListUrl = `https://jpmtl.com/v2/chapter/${novelUrl}/list?state=published&structured=true&d`;

    const chapterResult = await fetch(chapterListUrl);
    const volumes = await chapterResult.json();

    volumes.map((volume) => {
        volume.chapters.map((chapter) => {
            const chapterName = chapter.title;
            const releaseDate = chapter.created_at;
            const chapterUrl = chapter.id;

            const obj = {
                sourceId: 14,
                chapterName,
                releaseDate,
                chapterUrl,
            };

            novelChapters.push(obj);
        });
    });

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}books/${novelUrl}/${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    console.log(url);

    $ = cheerio.load(body);

    const chapterName = $(".chapter-content__title").text();
    let chapterText = $(".chapter-content__content").html();
    chapterText = htmlToText(chapterText);

    let nextChapter = null;
    let prevChapter = null;

    $(".chapter-wrapper__nav").each(function (result) {
        const chId = $(this)
            .attr("href")
            .replace("/books/" + novelUrl + "/", "");
        if (chId < chapterUrl) {
            prevChapter = chId;
        } else {
            nextChapter = chId;
        }
    });

    novelUrl += "/";

    const chapter = {
        sourceId: 14,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
        nextChapter,
        prevChapter,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    const url = `https://jpmtl.com/v2/book/show/browse?query=${searchTerm}&categories=&content_type=2&direction=0&page=1&limit=20&type=5&status=all&language=3&exclude_categories=`;

    const result = await fetch(url);
    const body = await result.json();

    const novels = [];

    body.map((item) => {
        const novelName = item.title;
        const novelCover = item.cover;
        const novelUrl = item.id + "/";

        const novel = { sourceId: 14, novelName, novelCover, novelUrl };

        novels.push(novel);
    });

    return novels;
};

const JPMTLScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default JPMTLScraper;
