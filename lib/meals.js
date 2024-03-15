import fs from "node:fs";

import sql from "better-sqlite3";
import slugify from "slugify";

const db = sql("meals.db");

export async function getMeals() {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // throw new Error('Loading meals failed')
    return db.prepare("SELECT * FROM meals ").all();
}

export function getMeal(slug) {
    return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
}

export async function saveMeal(meal) {
    // const slug = slugify(meal.title, { lower: true });
    // const instructions = xss(meal.instructions);

    meal.slug = slugify(meal.title, { lower: true });
    meal.instructions = xss(meal.instructions);

    const extension = meal.image.name.split(".").pop();
    const fileName = `${meal.slug}.${extension}`;

    const stream = fs.createWriteStream(`public/images/${fileName}`);
    const bufferedImage = await meal.image.arrayBuffer();

    stream.write(Buffer.from(bufferedImage), (error) => {
        if (error) {
            throw new Error("Image not uploaded! Try again.");
        }
    });

    meal.image = `/images/${fileName}`;

    db.prepare(
        `
        INSERT INTO meals
            (title, summary, instruction, creator, creator_email, image, slug)
        VALUE (
            @title,
            @summary,
            @instructions,
            @creator,
            @creator_email,
            @image,
            @slug,
        )
    `
    ).run(meal);
}
