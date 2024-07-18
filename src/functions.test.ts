import { describe, test } from "vitest"
import type { FunctionDef, ObjectProp, Prop } from "./functions.js"
import {
	formatFunctionDefinitions,
	formatObjectProperties,
	formatType,
	isAnyOfProp,
} from "./functions.js"

describe("isAnyOfProp", () => {
	test("true", ({ expect }) => {
		const result = isAnyOfProp({ anyOf: [] })
		expect(result).toBe(true)
	})

	test("false", ({ expect }) => {
		const result = isAnyOfProp({ type: "null" })
		expect(result).toBe(false)
	})
})

describe("formatFunctionDefinitions", () => {
	test("empty array", ({ expect }) => {
		const result = formatFunctionDefinitions([])
		expect(result).toBe(`namespace functions {

} // namespace functions`)
	})

	test("single function with no parameters", ({ expect }) => {
		const functions: FunctionDef[] = [
			{
				name: "testFunction",
				description: "A test function",
				parameters: { type: "object" },
			},
		]

		const result = formatFunctionDefinitions(functions)
		expect(result).toBe(`namespace functions {

// A test function
type testFunction = () => any;

} // namespace functions`)
	})

	test("single function with parameters", ({ expect }) => {
		const functions: FunctionDef[] = [
			{
				name: "testFunction",
				description: "A test function",
				parameters: {
					type: "object",
					properties: {
						param1: { type: "string" },
						param2: { type: "number" },
					},
					required: ["param1"],
				},
			},
		]

		const result = formatFunctionDefinitions(functions)
		expect(result).toBe(`namespace functions {

// A test function
type testFunction = (_: {
param1: string,
param2?: number,
}) => any;

} // namespace functions`)
	})

	test("multiple functions", ({ expect }) => {
		const functions: FunctionDef[] = [
			{
				name: "functionOne",
				description: "First function",
				parameters: { type: "object" },
			},
			{
				name: "functionTwo",
				description: "Second function",
				parameters: {
					type: "object",
					properties: { param1: { type: "boolean" } },
				},
			},
		]

		const result = formatFunctionDefinitions(functions)
		expect(result).toBe(`namespace functions {

// First function
type functionOne = () => any;

// Second function
type functionTwo = (_: {
param1?: boolean,
}) => any;

} // namespace functions`)
	})
})

describe("formatObjectProperties", () => {
	test("empty object", ({ expect }) => {
		const obj: ObjectProp = { type: "object" }
		const result = formatObjectProperties(obj, 0)
		expect(result).toBe("")
	})

	test("single required property", ({ expect }) => {
		const obj: ObjectProp = {
			type: "object",
			properties: { prop1: { type: "string" } },
			required: ["prop1"],
		}

		const result = formatObjectProperties(obj, 0)
		expect(result).toBe("prop1: string,")
	})

	test("multiple properties with optional ones", ({ expect }) => {
		const obj: ObjectProp = {
			type: "object",
			properties: { prop1: { type: "string" }, prop2: { type: "number" } },
			required: ["prop1"],
		}

		const result = formatObjectProperties(obj, 0)
		expect(result).toBe("prop1: string,\nprop2?: number,")
	})

	test("nested objects", ({ expect }) => {
		const obj: ObjectProp = {
			type: "object",
			properties: {
				prop1: { type: "object", properties: { subProp: { type: "boolean" } } },
			},
			required: ["prop1"],
		}

		const result = formatObjectProperties(obj, 0)
		expect(result).toBe("prop1: {\n  subProp?: boolean,\n},")
	})
})

describe("formatType", () => {
	test("string", ({ expect }) => {
		const param: Prop = { type: "string" }
		const result = formatType(param, 0)

		expect(result).toBe("string")
	})

	test("number", ({ expect }) => {
		const param: Prop = { type: "number" }
		const result = formatType(param, 0)

		expect(result).toBe("number")
	})

	test("integer", ({ expect }) => {
		const param: Prop = { type: "integer" }
		const result = formatType(param, 0)

		expect(result).toBe("number")
	})

	test("boolean", ({ expect }) => {
		const param: Prop = { type: "boolean" }
		const result = formatType(param, 0)

		expect(result).toBe("boolean")
	})

	test("null", ({ expect }) => {
		const param: Prop = { type: "null" }
		const result = formatType(param, 0)

		expect(result).toBe("null")
	})

	test("object", ({ expect }) => {
		const param: Prop = {
			type: "object",
			properties: { prop1: { type: "string" } },
			required: ["prop1"],
		}

		const result = formatType(param, 0)
		expect(result).toBe("{\n  prop1: string,\n}")
	})

	test("array", ({ expect }) => {
		const param: Prop = { type: "array", items: { type: "string" } }
		const result = formatType(param, 0)

		expect(result).toBe("string[]")
	})

	test("anyOf", ({ expect }) => {
		const param: Prop = { anyOf: [{ type: "string" }, { type: "number" }] }

		const result = formatType(param, 0)
		expect(result).toBe("string | number")
	})
})
