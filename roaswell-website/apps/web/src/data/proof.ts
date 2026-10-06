export type Testimonial = {
	quote: string;
	author: string;
	role: string;
	company: string;
};

export type ClientLogo = {
	name: string;
	src: string;
	url?: string;
};

// Only add entries with written permission from the client.
export const testimonials: Testimonial[] = [];

export const clientLogos: ClientLogo[] = [];
