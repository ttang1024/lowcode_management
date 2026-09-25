import type { FormRuleItem } from 'lowcode-kit';
import type { AbstractRules } from 'lowcode-blocks/src/interface';
import { ruler } from 'lowcode-registry';

function createRule(rule: FormItemRuleModel, item: FormItemModel): FormRuleItem {
  const registration = ruler.getRegistration(rule.name);
  const message = item.title + (rule.message || registration?.message || '');
  if (registration?.name == 'required') {
    return {
      required: true,
      message: message,
    };
  }
  return ruler.getRule(rule.name, { config: rule.options, message });
}

export default function useFormRules(elements: FormItemModel[]): AbstractRules {
  const rules = {} as AbstractRules;
  elements?.forEach((element) => {
    if (element.rules) {
      rules[element.name] = element.rules.map((item) => createRule(item, element)).filter(Boolean);
    }
  });
  return rules;
}