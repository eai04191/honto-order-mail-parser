import express = require("express");
import { node as kirinuki } from "kirinuki-core";
import { ISchema } from "kirinuki-core/lib/types";
const router = express.Router();

const schema: ISchema = {
    books: {
        _unfold: true,
        title: [
            ".content > tbody > tr:nth-of-type(1) .content tr:nth-of-type(2) a",
            "text",
        ],
        link:
            ".content > tbody > tr:nth-of-type(1) .content tr:nth-of-type(2) a",
        author:
            ".content > tbody > tr:nth-of-type(1) .content tr:nth-of-type(3) p",
        price: ".content > tbody > tr:nth-of-type(2) .td-pd10 p span",
    },
};

interface Book {
    title: string;
    link: string;
    author: string;
    price: string;
}

interface imageLinks {
    265: string;
    155: string;
    133: string;
    90: string;
    81: string;
    75: string;
}

const blankBook: Book = {
    title: "",
    link: "",
    author: "",
    price: "",
};

function createHontoThumbnails(id: string): imageLinks {
    function create(
        size: number,
        id: string,
        page: number = 1,
        typearg: string,
        ext: string
    ) {
        const base = "https://image.honto.jp/item/1";
        const id1 = id.slice(0, 4);
        const id2 = id.slice(-4);
        const type = typearg === "none" ? "" : typearg;
        return `${base}/${size}/${id1}/${id2}/${id}_${page}${type}.${ext}`;
    }
    return {
        265: create(265, id, 1, "none", "png"),
        155: create(155, id, 1, "none", "png"),
        133: create(133, id, 1, "BL", "png"),
        90: create(90, id, 1, "none", "jpg"),
        81: create(81, id, 1, "BC", "png"),
        75: create(75, id, 1, "CC", "png"),
    };
}

router.post("/parse", function (req, res) {
    if (!req.body.html) {
        res.status(500).json({
            message: "missing parameters",
        });
        return;
    }

    const returnArr: any = [];

    const kResult = kirinuki(schema, req.body.html);

    if (kResult.books instanceof Array) {
        kResult.books.forEach((undefinableBook) => {
            const book: Book = Object.assign({}, blankBook, undefinableBook);
            if (book.link !== "") {
                book.author = book.author.replace(/^著者:/, "");
                book.author = book.author.replace(/（著者）$/, "");

                const [, id] = book.link.match(/pd_(\d+).html/);
                const images = createHontoThumbnails(id);
                const bookWithImageLinks = Object.assign({}, book, { images });
                returnArr.push(bookWithImageLinks);
            }
        });
    } else {
        res.status(500).json({
            message: "parse error",
        });
        return;
    }

    res.json(returnArr);
});

export default router;
