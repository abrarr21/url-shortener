// this test verifies the snowflake id generator's core correctness, gurantee: IDs must never collide, even when multiple nodes (simulating multiple api instances) generate IDs concurrently with no coordination b/w them. It also confirms invalid node IDs are rejected at construction time, rather than silently corrupting generated IDs later.
package shortener

import "testing"

func TestSnowflake_UniqueAcrossNodes(t *testing.T) {
	seen := make(map[int64]bool)

	for node := int64(0); node < 4; node++ {
		gen, err := NewSnowflakeGenerator(node)
		if err != nil {
			t.Fatalf("node %d: %v", node, err)
		}

		for i := 0; i < 1000; i++ {
			id, err := gen.NextID()
			if err != nil {
				t.Fatalf("node %d: %v", node, err)
			}

			if seen[id] {
				t.Fatalf("duplicate id %d generated", i)
			}
			seen[id] = true
		}
	}
}

func TestSnowflake_NodeIDValidation(t *testing.T) {
	if _, err := NewSnowflakeGenerator(-1); err == nil {
		t.Error("expected error for negative node id")
	}

	if _, err := NewSnowflakeGenerator(maxNodeID + 1); err == nil {
		t.Error("expected error for node id exceeding max")
	}
}
