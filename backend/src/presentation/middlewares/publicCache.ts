import { NextFunction, Request, Response } from "express";

// Applies only to public, non-personalized GET routes (catalog reads) - never
// to admin or authenticated endpoints. `s-maxage` lets a CDN/edge cache serve
// repeat requests without waking the Render backend; `stale-while-revalidate`
// lets it serve a slightly stale copy while refetching in the background
// instead of every visitor paying for a cold-start-affected fetch.
export function publicCache(seconds: number) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.set("Cache-Control", `public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${seconds * 2}`);
    next();
  };
}
