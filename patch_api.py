with open("frontend/src/lib/api.ts", "r") as f:
    content = f.read()

replacement = """    },
    syncRoadmapSkills: async (roadmapId: number, data: any): Promise<any> => {
        const response = await api.post(`/roadmaps/${roadmapId}/skills/sync`, data);
        return response.data;
    }
};

// --- Profile APIs ---"""

content = content.replace("    }\n};\n\n// --- Profile APIs ---", replacement)

with open("frontend/src/lib/api.ts", "w") as f:
    f.write(content)
