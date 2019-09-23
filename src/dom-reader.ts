import { Bristles } from "bristles";

export function DomReader(root: JQuery, rules: DomReaderRules): Promise<any> {
  const output: any = {};

  for (const [name, rule] of Object.entries(rules)) {
    const values: any[] = [];

    const elements = rule.selector ? root.find(rule.selector) : root;

    for (const element of Array.from(elements)) {
      let value: any = null;

      if (element !== null) {
        if (typeof rule.attribute === 'string') {
          const attribute = Bristles.compile(rule.attribute)(rule)

          switch (attribute) {
            case ('$html'):
              value = $(element).html();
              break;
            case ('$text'):
              value = $(element).text();
              break;
            default:
              value = $(element).attr(attribute);
          }
        } else if (rule.attribute) {
          value = DomReader($(element), rule.attribute);
        }
      }

      if (typeof value === 'undefined' || value === null) {
        if (typeof rule.default === 'string') {
          value = Bristles.compile(rule.default)(rule);
        } else if (typeof rule.default !== 'undefined') {
          value = rule.default;
        } else {
          value = null;
        }
      }

      if (rule.postProcessing) {
        value = Bristles.compile(rule.postProcessing)({ rule, value, output });
      }

      values.push(value);
    }

    if (!rule.array) {
      output[name] = values[0] || null;
    } else {
      output[name] = values;
    }
  }

  return output;
}

export interface DomReaderRules {
  [name: string]: DomReaderRule;
}

export interface DomReaderRule {
  selector?: string;
  attribute?: string|DomReaderRules;
  default?: string;
  array?: boolean;
  postProcessing?: string;
}