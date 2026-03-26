# Quick Filter Examples

## Common Filter Scenarios

### 1. Get All New Leads

```
Filter Mode: And
Filter Rules:
  - Field: lead.status
  - Operator: Equals To
  - Value: New
```

### 2. Get Leads from Website Source

```
Filter Mode: And
Filter Rules:
  - Field: lead.source
  - Operator: Equals To
  - Value: Website
```

### 3. Get Leads Created Today

```
Filter Mode: And
Filter Rules:
  - Field: lead.created_at
  - Operator: Today
  - Value: (leave empty)
```

### 4. Get Leads with Email Containing "@gmail.com"

```
Filter Mode: And
Filter Rules:
  - Field: lead.email
  - Operator: Contains
  - Value: @gmail.com
```

### 5. Get Leads without Phone Number

```
Filter Mode: And
Filter Rules:
  - Field: lead.mobile_number
  - Operator: Is Empty
  - Value: (leave empty)
```

### 6. Get New Leads from Facebook

```
Filter Mode: And
Filter Rules:
  - Field: lead.status
  - Operator: Equals To
  - Value: New
  - Field: lead.source
  - Operator: Equals To
  - Value: Facebook
```

### 7. Get Leads with Service Interest in SEO

```
Filter Mode: And
Filter Rules:
  - Field: cf_service_interest
  - Operator: Equals To
  - Value: SEO
```

### 8. Get Leads with Budget $5k+

```
Filter Mode: And
Filter Rules:
  - Field: cf_monthly_budget
  - Operator: Equals To
  - Value: $5k+
```

### 9. Get Leads with Timeline ASAP

```
Filter Mode: And
Filter Rules:
  - Field: cf_timeline
  - Operator: Equals To
  - Value: ASAP
```

### 10. Get New OR Contacted Leads

```
Filter Mode: Or
Filter Rules:
  - Field: lead.status
  - Operator: Equals To
  - Value: New
  - Field: lead.status
  - Operator: Equals To
  - Value: Contacted
```

### 11. Get Leads from Multiple Sources

```
Filter Mode: Or
Filter Rules:
  - Field: lead.source
  - Operator: Equals To
  - Value: Website
  - Field: lead.source
  - Operator: Equals To
  - Value: Facebook
  - Field: lead.source
  - Operator: Equals To
  - Value: WhatsApp
```

### 12. Get Leads Created This Month

```
Filter Mode: And
Filter Rules:
  - Field: lead.created_at
  - Operator: This Month
  - Value: (leave empty)
```

### 13. Get Leads with Company Name Starting with "Tech"

```
Filter Mode: And
Filter Rules:
  - Field: cf_company
  - Operator: Starts With
  - Value: Tech
```

### 14. Get Unattended Leads

```
Filter Mode: And
Filter Rules:
  - Field: lead.status
  - Operator: Equals To
  - Value: Lead Unattended
```

### 15. Get Won Leads

```
Filter Mode: And
Filter Rules:
  - Field: lead.status
  - Operator: Equals To
  - Value: Lead Won
```

## JSON Mode Examples

### Basic Filter

```json
{
	"filter": {
		"mode": "AND",
		"rules": [
			{
				"field": "lead.status",
				"operator": "Equals To",
				"value": "New"
			}
		]
	}
}
```

### Multiple Conditions

```json
{
	"filter": {
		"mode": "AND",
		"rules": [
			{
				"field": "lead.status",
				"operator": "Equals To",
				"value": "New"
			},
			{
				"field": "lead.source",
				"operator": "Equals To",
				"value": "Website"
			},
			{
				"field": "cf_company",
				"operator": "Contains",
				"value": "Tech"
			}
		]
	}
}
```

### OR Logic

```json
{
	"filter": {
		"mode": "OR",
		"rules": [
			{
				"field": "lead.status",
				"operator": "Equals To",
				"value": "New"
			},
			{
				"field": "lead.status",
				"operator": "Equals To",
				"value": "Contacted"
			}
		]
	}
}
```

### Complete Request Body

```json
{
	"per_page": 50,
	"page": 1,
	"search": "john",
	"filter": {
		"mode": "AND",
		"rules": [
			{
				"field": "lead.status",
				"operator": "Equals To",
				"value": "New"
			},
			{
				"field": "lead.source",
				"operator": "Equals To",
				"value": "Website"
			}
		]
	},
	"sort_by": "name",
	"sort_dir": "asc"
}
```

## Tips

1. **Use List Query Fields**: First call `List Query Fields` with context `lead.list` to see all available fields and their options
2. **Check Field Types**: Different field types support different operators
3. **Select Fields**: For select fields (status, source, etc.), use the exact option value from the API response
4. **Date Fields**: Date operators like `Today`, `Yesterday`, `This Week` don't require a value
5. **Empty Checks**: Use `Is Empty` or `Is Not Empty` without a value
6. **Filter Mode**: Use `And` when all conditions must match, `Or` when any condition can match
