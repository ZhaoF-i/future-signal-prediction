import csv,json,sys,warnings
from pathlib import Path
import numpy as np
sys.path.insert(0,str(Path(__file__).resolve().parent))
import export_examples as ex
warnings.filterwarnings('ignore',category=ex.wavfile.WavFileWarning)
import argparse
parser=argparse.ArgumentParser(description='Select a qualitative example for each added corpus.')
parser.add_argument('--manifest',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args()
manifest=args.manifest
rows=list(csv.DictReader(manifest.open()))
selected=[]
for domain,folder in [('Speech','timit_audio'),('Speech','aishell1_audio'),('Noise','noisex92_audio'),('Noise','esc50_audio')]:
 roots=[Path(next(r['result_dir'] for r in rows if r['domain']==domain and r['period']=='4' and r['method']==method))/folder for method in ['Base','RandomInterval']]
 eligible=[]; exclusions={}
 for path in sorted(roots[0].glob('*_target_*.wav')):
  name=path.name; pred=name.replace('_target_','_estimate_')
  try:
   arrays=[ex.read_audio(r/n) for r in roots for n in [name,pred]]
   common=min(len(arrays[0])-1,len(arrays[1])-1,len(arrays[2]),len(arrays[3]))
   size=min(common,64000) if domain=='Speech' else common
   starts=sorted(set(range(0,common-size+1,16000))|{common-size})
   start=max(starts,key=lambda s:float(arrays[2][s:s+size]@arrays[2][s:s+size]))
   streams,_,_=ex.align_and_crop(*arrays,start,size)
   a,b=[ex.hamai_error(streams[0],p,period=4) for p in streams[1:]]
   nm=[10*np.log10(r['error_energy']/r['target_energy']) for r in [a,b]]
   reduction=a['hamai_error_db']-b['hamai_error_db']
   if a['valid'] and b['valid'] and a['hamai_error_db']>-20 and reduction>=10 and nm[1]<=nm[0]:
    # Ensure the existing shared-gain PCM16 export can also hold exact differences.
    gain=np.floor(.95*32768)/32768/max(np.max(np.abs(s)) for s in streams)
    pcms=[np.rint(s*gain*32768).astype(np.int32) for s in streams]
    if max(np.max(np.abs(pcms[0]-p)) for p in pcms[1:])>32767: continue
    eligible.append((reduction,name,start,size,a['hamai_error_db'],b['hamai_error_db'],nm))
  except ValueError as e: exclusions[str(e)]=exclusions.get(str(e),0)+1
 eligible.sort()
 print(domain,folder,'eligible',len(eligible),'exclusions',exclusions,flush=True)
 if not eligible: raise RuntimeError(folder)
 c=eligible[len(eligible)//2]
 result=dict(domain=domain,folder=folder,filename=c[1],start=c[2],samples=c[3],eligible_count=len(eligible),scores=c[4:6],nmse=c[6])
 selected.append(result);print(result,flush=True)
args.output.write_text(json.dumps(selected,indent=2))
