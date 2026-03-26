// @ts-nocheck
export const restructureModelsForPackedCircle = (models) => {
  const hierarchy = { name: "root", children: [] };
  const providers = {};

  models.forEach(model => {
    const { provider, category, name, context_window } = model;

    if (!providers[provider]) {
      providers[provider] = {
        name: provider,
        children: {}
      };
    }

    if (!providers[provider].children[category]) {
      providers[provider].children[category] = {
        name: category,
        children: []
      };
    }

    providers[provider].children[category].children.push({
      name: name,
      value: context_window || 1000, // Use context_window for sizing, default to 1000 if not available
      modelData: model // Store original model data for tooltips and selection
    });
  });

  for (const providerName in providers) {
    const provider = providers[providerName];
    const providerNode = { name: providerName, children: [] };
    for (const categoryName in provider.children) {
      providerNode.children.push(provider.children[categoryName]);
    }
    hierarchy.children.push(providerNode);
  }

  return hierarchy;
};