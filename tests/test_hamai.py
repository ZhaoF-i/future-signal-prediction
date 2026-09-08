import importlib.util
from pathlib import Path
import numpy as np
spec=importlib.util.spec_from_file_location('hamai',Path(__file__).resolve().parents[1] / 'public' / 'hamai.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
rng=np.random.default_rng(20260908)
y=rng.normal(size=8192)
for p in [2,3,4,8,16]:
    n=np.arange(len(y));e=.2*y*np.cos(2*np.pi*n/p)
    result=m.hamai_error(y,y+e,p)
    assert -.001 < result['hamai_error_db'] <= 0
    cols=[]
    for k in range(1,p//2+1):
        cols.append(np.cos(2*np.pi*k*(n%p)/p))
        if 2*k!=p:cols.append(np.sin(2*np.pi*k*(n%p)/p))
    T=y[:,None]*np.column_stack(cols);G=T.T@T
    c=np.linalg.solve(G+1e-6*np.trace(G)/(p-1)*np.eye(p-1), T.T@e)
    np.testing.assert_allclose(result['mirror_energy'], np.sum((T@c)**2),rtol=1e-10)
    r=m.hamai_error(2*y,2*(y+e),p)
    np.testing.assert_allclose(r['hamai_error_db'],result['hamai_error_db'],atol=1e-10)
assert m.hamai_error(y,y,4)['hamai_error_db']==0
assert m.hamai_error(y,y,4)['status']=='no_error'
assert m.hamai_error(y,y+1e-9,4)['status']=='low_error'
assert m.hamai_error(np.zeros(32),np.ones(32),4)['status']=='silent_target'
for args in [(y,y[:-1],4),(y,y,True),(y,y,1),(y+complex(0,1),y,4)]:
    try:m.hamai_error(*args)
    except ValueError:pass
    else:raise AssertionError('invalid input accepted')
noise=m.hamai_error(y,rng.normal(size=len(y)),4)
assert noise['hamai_error_db'] < -20
print('PASS: explicit projection equivalence for five periods, scale invariance, pure mirror, noise, zero error, silence, and invalid inputs')
