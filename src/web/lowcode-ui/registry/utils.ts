export function format(template: string, data: Record<string, any>) {
  if (data && template) {
    template = template.replace(/(\{(\d|\w)+\})/g, function(a) {
      return data[a.replace(/\{|\}/g, '')];
    });
  }
  return template;
};