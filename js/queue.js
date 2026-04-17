/**
 * queue.js — Queue system and visual position management.
 *
 * QueueSystem draws decorative queue-marker circles onto
 * #queue-markers so the player can see where customers will
 * stand. The actual customer positioning is managed by
 * CustomerManager; this module just handles the background
 * indicator tiles.
 */

class QueueSystem {
  /**
   * @param {object} opts
   * @param {number} opts.maxSlots  Maximum visible queue positions.
   */
  constructor({ maxSlots = 5 } = {}) {
    this._maxSlots   = maxSlots;
    this._markerEl   = document.getElementById('queue-markers');
    this._rendered   = false;
  }

  /**
   * Draw the static queue-position markers.
   * Called once when the game screen becomes visible.
   */
  renderMarkers() {
    if (this._rendered) return;
    this._rendered = true;
    this._markerEl.innerHTML = '';

    const sceneEl = document.getElementById('shop-scene');
    const sceneW  = sceneEl ? sceneEl.offsetWidth  : 600;
    const sceneH  = sceneEl ? sceneEl.offsetHeight : 400;

    const baseBottom = Math.round(sceneH * 0.22) + 4; // align with customer feet
    const spacing    = 52;
    const startX     = sceneW - 80;

    for (let i = 0; i < this._maxSlots; i++) {
      const marker = document.createElement('div');
      marker.className = 'queue-marker';
      marker.style.left   = `${startX - i * spacing}px`;
      marker.style.bottom = `${baseBottom}px`;
      this._markerEl.appendChild(marker);
    }

    // Counter position marker
    const counterMarker = document.createElement('div');
    counterMarker.className = 'queue-marker';
    counterMarker.style.left   = '60px';
    counterMarker.style.bottom = `${baseBottom}px`;
    this._markerEl.appendChild(counterMarker);
  }

  /** Clear markers (e.g. when returning to start screen). */
  clear() {
    this._markerEl.innerHTML = '';
    this._rendered = false;
  }
}
