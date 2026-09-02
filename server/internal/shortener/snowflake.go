package shortener

import (
	"errors"
	"fmt"
	"sync"
	"time"
)

const (
	nodeBits     = 10 // how many bits for "which server"
	sequenceBits = 12 // how many bits for "ticket count this millisecond"

	maxNodeID   = -1 ^ (-1 << nodeBits)     // biggest badge number allowed = 1023
	maxSequence = -1 ^ (-1 << sequenceBits) // biggest ticket count allowed = 4095

	nodeShift      = sequenceBits            // node slot starts after sequence slot
	timestampShift = sequenceBits + nodeBits // timestamp slot starts after both

	customEpoch = 1704067200000 // Jan 1, 2024, in milliseconds — our "day zero"
)

type SnowflakeGenerator struct {
	mu            sync.Mutex
	nodeID        int64
	lastTimestamp int64
	sequence      int64
}

// constructor that checks nodeID before handing a working generator back to the caller
func NewSnowflakeGenerator(nodeID int64) (*SnowflakeGenerator, error) {
	if nodeID < 0 || nodeID > maxNodeID {
		return nil, fmt.Errorf("node id must be between 0 and %d, got %d", maxNodeID, nodeID)
	}

	return &SnowflakeGenerator{nodeID: nodeID}, nil
}

func (s *SnowflakeGenerator) NextID() (int64, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now().UnixMilli() - customEpoch

	if now < s.lastTimestamp {
		// servers clock moved backward
		return 0, errors.New("clock moved backwards, refusing to generate id")
	}

	if now == s.lastTimestamp {
		// same millisecond as last ID, increment sequence
		s.sequence = (s.sequence + 1) & maxSequence

		if s.sequence == 0 {
			// we've used up all the sequence numbers for this millisecond, wait for the next millisecond
			for now <= s.lastTimestamp {
				now = time.Now().UnixMilli() - customEpoch
			}
		}
	} else {
		// new millisecodn, reset sequence to 0
		s.sequence = 0
	}

	s.lastTimestamp = now

	id := (now << timestampShift) | (s.nodeID << nodeShift) | s.sequence

	return id, nil
}
