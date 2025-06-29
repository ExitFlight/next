// src/lib/airlineTemplate.ts
import { AirlineTemplate } from "@/src/types/schema";

export async function getAirlineTemplate(
  airlineCode: string,
): Promise<AirlineTemplate> {
  const code = airlineCode.toLowerCase();
  try {
    const templateModule = await import(
      `@/src/lib/airline-templates/${code}.json`
    );

    return templateModule.default as AirlineTemplate;
  } catch (error) {
    console.warn(
      `Template for airline code "${code}" not found. Falling back to default.`,
    );

    const defaultTemplateModule = await import(
      `@/src/lib/airline-templates/default.json`
    );
    return defaultTemplateModule.default as AirlineTemplate;
  }
}
