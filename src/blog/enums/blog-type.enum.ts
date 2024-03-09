export enum EBlogType {
  promotion = Number(process.env.PROMOTION),
  news = Number(process.env.NEWS),
  product = Number(process.env.PRODUCT),
  program = Number(process.env.PROGRAM),
}