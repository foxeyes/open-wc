import { expect, fixture } from '@open-wc/testing';
import { registerElement, defineScopedElement } from '../src/registerElement.js';
import { Cache } from '../src/Cache.js';

const NativeHTMLElement = window.HTMLElement;
function mimicScopedRegistryPolyFill() {
  window.HTMLElement = function HTMLElement() {};
  window.HTMLElement.prototype = NativeHTMLElement.prototype;
}
function restoreMimicScopedRegistryPolyFill() {
  window.HTMLElement = NativeHTMLElement;
}

class Naboo extends HTMLElement {}

describe('registerElement', () => {
  it('should return the scoped tag name', () => {
    const nabooTag = registerElement('naboo-planet', Naboo);

    expect(nabooTag).to.match(new RegExp(`naboo-planet-\\d{1,5}`));
  });

  it('should throw an error with lazy components and no tags cache', () => {
    expect(() => registerElement('naboo-planet', undefined)).to.throw();
  });

  it('should work when window.HTMLElement is polyfilled and native HTMLElement is provided', () => {
    class Unpatched extends window.HTMLElement {}
    mimicScopedRegistryPolyFill();
    class Patched extends window.HTMLElement {}

    const cache = new Cache();
    registerElement('wc-unpatched', Unpatched, cache);
    registerElement('wc-patched', Patched, cache);

    // When the elements above would not extend HTMLElement (native or patched), they
    // would be added to cache inside "storeLazyElementInCache" method.
    // So cache should still be empty:
    expect(cache._cache.size).to.equal(0);

    restoreMimicScopedRegistryPolyFill();
  });
});

describe('defineScopedElement', () => {
  it('should allow the use of lazy elements', async () => {
    const tagsCache = new Map();
    const tag = registerElement('naboo-planet', undefined, tagsCache);
    const el = await fixture(`<${tag}></${tag}>`);

    expect(el).to.not.be.an.instanceOf(Naboo);
    defineScopedElement('naboo-planet', Naboo, tagsCache);

    expect(el).to.be.an.instanceOf(Naboo);
  });
});
