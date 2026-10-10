import { themeCssVariables } from 'twenty-ui/theme';

type PageSectionHeadingProps = {
  title: string;
  description?: string;
};

export const PageSectionHeading = ({ title, description }: PageSectionHeadingProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: themeCssVariables.spacing[1] }}>
    <h2
      style={{
        color: themeCssVariables.font.color.primary,
        fontSize: themeCssVariables.font.size.lg,
        fontWeight: themeCssVariables.font.weight.semiBold,
        lineHeight: themeCssVariables.text.lineHeight.md,
        margin: 0,
      }}
    >
      {title}
    </h2>
    {description !== undefined && (
      <p
        style={{
          color: themeCssVariables.font.color.tertiary,
          fontSize: themeCssVariables.font.size.md,
          lineHeight: themeCssVariables.text.lineHeight.lg,
          margin: 0,
        }}
      >
        {description}
      </p>
    )}
  </div>
);
