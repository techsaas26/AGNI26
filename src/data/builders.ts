/**
 * Who built the site. `linkedin` is the profile their portrait and the "LinkedIn" label under their name open; `instagram` is the
 * "Instagram" label below it (either empty: that label stays greyed out, not a link).
 * Centre first: Kulasekaran is the focal portrait, the others step outward in pairs. `role` shows on hover when set.
 * The photos are framed differently, so `zoom` (× the frame's height) and `y` (top edge, as a fraction of the frame) even out the
 * heads: every face comes out about the same size, at about the same height.
 */
export const builders: { name: string; image: string; w: number; zoom: number; y: number; role?: string; linkedin?: string; instagram?: string }[] = [
  { name: "Akileswaran", image: "/images/footer/akil.webp", linkedin: "https://www.linkedin.com/in/akileswaran-ammamuthu-b12610347", instagram: "https://www.instagram.com/demi_god.aki", w: 566, zoom: 1.08, y: 0.05 },
  { name: "Harish", image: "/images/footer/harish.webp", linkedin: "https://www.linkedin.com/in/harish-m-348011331", instagram: "https://www.instagram.com/_i_am_being_myself__", w: 474, zoom: 1.33, y: -0.19 },
  { name: "Kulasekaran", image: "/images/footer/kulasekaran.webp", linkedin: "https://www.linkedin.com/in/kulasekaranm/", instagram: "https://www.instagram.com/_.ks711/", w: 620, zoom: 1.11, y: -0.02 },
  { name: "Balasanthoshraj", image: "/images/footer/balasanthosh.webp", linkedin: "https://www.linkedin.com/in/balasanthoshraj", instagram: "https://www.instagram.com/balasanthosh_raj/", w: 620, zoom: 1.13, y: -0.13 },
  { name: "Kavinarasan", image: "/images/footer/kavin.webp", linkedin: "https://www.linkedin.com/in/kavinarasan3023", instagram: "https://www.instagram.com/swas_3023", w: 503, zoom: 0.96, y: 0.03 },
];
